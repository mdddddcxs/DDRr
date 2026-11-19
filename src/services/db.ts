// Accès aux données (Supabase). Toutes les règles de sécurité sont dans la base (RLS) :
// un visiteur ne peut qu'envoyer des formulaires ; seuls les admins lisent et modifient.
import { db, supabase } from '../lib/supabase';
import type { PublicTestimony, Appointment, ConversionRequest, Donation, DonationCampaign, InboxMessage, NewsItem } from '../types';
import { SCHOOL_CAMPAIGN } from '../constants';

const unwrap = <T,>(r: { data: T | null; error: any }): T => {
  if (r.error) throw r.error;
  return r.data as T;
};

// ---------------------------------------------------------------------------
// Public : lecture
// ---------------------------------------------------------------------------
export async function getMaintenance(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.from('settings').select('value').eq('key', 'maintenance').maybeSingle();
  return (data as any)?.value === true;
}

const toCampaign = (r: any): DonationCampaign => ({
  ...SCHOOL_CAMPAIGN,
  id: r.id,
  title: r.title,
  description: r.description || SCHOOL_CAMPAIGN.description,
  targetAmount: Number(r.target_amount),
  currentAmount: Number(r.current_amount),
  imageUrl: r.image_url || SCHOOL_CAMPAIGN.imageUrl,
});

export async function getCampaign(id = SCHOOL_CAMPAIGN.id): Promise<DonationCampaign> {
  if (!supabase) return SCHOOL_CAMPAIGN;
  const { data, error } = await supabase.from('campaigns').select('*').eq('id', id).maybeSingle();
  if (error || !data || Array.isArray(data) || !(data as any).id) return SCHOOL_CAMPAIGN;
  return toCampaign(data);
}

export type PublicDonation = { id: string; amount: number; donorName: string; method: string; createdAt: string };
export async function getRecentDonations(limit = 10): Promise<PublicDonation[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('recent_donations', { max_rows: limit });
  if (error || !data) return [];
  return (data as any[]).map((d) => ({ id: d.id, amount: Number(d.amount), donorName: d.donor_name, method: d.method, createdAt: d.created_at }));
}

const toNews = (r: any): NewsItem => ({
  id: r.id,
  title: r.title,
  content: r.summary,
  body: r.body,
  imageUrl: r.image_url || '',
  category: r.category,
  createdAt: r.created_at,
  author: r.author,
  tags: r.tags || [],
});

/** Actualités publiées (null = base non configurée, la page affichera les articles de démonstration). */
export async function listNews(): Promise<NewsItem[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('news').select('*').eq('published', true).order('created_at', { ascending: false }).limit(50);
  if (error) return null;
  return (data || []).map(toNews);
}

export async function getNews(id: string): Promise<NewsItem | null> {
  if (!supabase || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabase.from('news').select('*').eq('id', id).maybeSingle();
  return data && (data as any).id ? toNews(data) : null;
}

// ---------------------------------------------------------------------------
// Public : formulaires (insertion seule — pas de .select() car un visiteur n'a pas le droit de relire)
// ---------------------------------------------------------------------------
export async function submitAppointment(a: { name: string; phone: string; subject: string; requestedDate?: string; message: string }) {
  unwrap(
    await db().from('appointments').insert({
      name: a.name.trim(),
      phone: a.phone.trim(),
      subject: a.subject.trim(),
      requested_date: a.requestedDate || null,
      message: a.message.trim(),
    }),
  );
}

export async function submitConversionRequest(c: { name: string; phone: string; location: string; method: 'presentiel' | 'video' }) {
  unwrap(await db().from('conversion_requests').insert({ name: c.name.trim(), phone: c.phone.trim(), location: c.location.trim() || null, method: c.method }));
}

export async function subscribeNewsletter(email: string) {
  const { error } = await db().from('newsletter_subscribers').insert({ email: email.trim().toLowerCase() });
  if (error && error.code !== '23505') throw error; // 23505 = déjà inscrit : on considère que c'est bon
}

export async function submitTestimony(t: { name: string; phone: string; type: 'text' | 'audio'; text?: string; audio?: Blob; audioDuration?: string; consentPublish?: boolean; city?: string }) {
  let content = (t.text || '').trim();
  if (t.type === 'audio') {
    if (!t.audio) throw new Error('audio manquant');
    if (t.audio.size > 3 * 1024 * 1024) throw new Error("Le message audio est trop long (3 Mo maximum).");
    const mime = (t.audio.type || 'audio/webm').split(';')[0];
    const ext = mime.includes('mp4') ? 'm4a' : mime.includes('ogg') ? 'ogg' : mime.includes('mpeg') ? 'mp3' : 'webm';
    const path = `incoming/${crypto.randomUUID()}.${ext}`;
    unwrap(await db().storage.from('testimonies').upload(path, t.audio, { contentType: mime, upsert: false }));
    content = path;
  }
  unwrap(
    await db().from('messages').insert({
      type: t.type,
      sender_name: t.name.trim(),
      sender_phone: t.phone.trim(),
      content,
      audio_duration: t.audioDuration || null,
      consent_publish: !!t.consentPublish,
      city: t.city?.trim().slice(0, 80) || null,
    }),
  );
}

/** Témoignages publiés par l'administration (prénom, ville et contenu seulement). */
export async function listPublicTestimonies(): Promise<PublicTestimony[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('public_testimonies', { max_rows: 30 });
  if (error || !Array.isArray(data)) return [];
  return data.map((r: any) => ({
    id: r.id,
    type: r.type,
    displayName: r.display_name || 'Anonyme',
    city: r.city || undefined,
    content: r.content,
    audioDuration: r.audio_duration || undefined,
    publishedAt: r.published_at,
  }));
}
/** Lien d'écoute temporaire d'un témoignage audio publié. */
export async function getPublicAudioUrl(path: string): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.storage.from('testimonies').createSignedUrl(path, 60 * 30);
  return data?.signedUrl || null;
}

// ---------------------------------------------------------------------------
// Administration
// ---------------------------------------------------------------------------
export async function adminSignIn(email: string, password: string) {
  const { error } = await db().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  const ok = await checkIsAdmin();
  if (!ok) {
    await db().auth.signOut();
    throw new Error("Ce compte n'a pas les droits d'administration.");
  }
}

export async function adminSignOut() {
  if (supabase) await supabase.auth.signOut();
}

export async function checkIsAdmin(): Promise<boolean> {
  if (!supabase) return false;
  const { data: s } = await supabase.auth.getSession();
  if (!s.session) return false;
  const { data, error } = await supabase.rpc('is_admin');
  return !error && data === true;
}

export async function setMaintenance(on: boolean) {
  unwrap(await db().from('settings').upsert({ key: 'maintenance', value: on, updated_at: new Date().toISOString() }));
}

const toAppointment = (r: any): Appointment => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  subject: r.subject,
  requestedDate: r.requested_date || '',
  message: r.message,
  status: r.status,
  adminComment: r.admin_comment || undefined,
  createdAt: r.created_at,
});
export async function listAppointments(): Promise<Appointment[]> {
  return unwrap(await db().from('appointments').select('*').order('created_at', { ascending: false }).limit(300)).map(toAppointment);
}
export async function updateAppointmentStatus(id: string, status: Appointment['status'], adminComment?: string) {
  unwrap(await db().from('appointments').update({ status, admin_comment: adminComment ?? null }).eq('id', id));
}
export async function deleteAppointment(id: string) {
  unwrap(await db().from('appointments').delete().eq('id', id));
}

const toMessage = (r: any): InboxMessage => ({
  id: r.id,
  type: r.type,
  senderName: r.sender_name,
  senderPhone: r.sender_phone || undefined,
  content: r.content,
  audioDuration: r.audio_duration || undefined,
  receivedAt: new Date(r.created_at).getTime(),
  expiresAt: String(r.expires_at).toLowerCase().includes('infinity') ? Infinity : new Date(r.expires_at).getTime(),
  isRead: r.is_read,
  consentPublish: !!r.consent_publish,
  published: !!r.published,
  displayName: r.display_name || undefined,
  city: r.city || undefined,
});
/** Supprime définitivement les messages expirés (et leurs fichiers audio). Appelé à l'ouverture de la boîte. */
async function purgeExpiredMessages() {
  const nowIso = new Date().toISOString();
  const { data } = await db().from('messages').select('id, type, content').lte('expires_at', nowIso).limit(200);
  if (!data?.length) return;
  const files = data.filter((m: any) => m.type === 'audio' && String(m.content).startsWith('incoming/')).map((m: any) => m.content);
  if (files.length) await db().storage.from('testimonies').remove(files);
  await db().from('messages').delete().in('id', data.map((m: any) => m.id));
}

export async function listMessages(): Promise<InboxMessage[]> {
  await purgeExpiredMessages().catch(() => {});
  return unwrap(
    await db().from('messages').select('*').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(300),
  ).map(toMessage);
}
export async function markMessageRead(id: string) {
  unwrap(await db().from('messages').update({ is_read: true }).eq('id', id));
}
export async function deleteMessage(m: InboxMessage) {
  if (m.type === 'audio' && m.content.startsWith('incoming/')) await db().storage.from('testimonies').remove([m.content]);
  unwrap(await db().from('messages').delete().eq('id', m.id));
}
/** Garder un témoignage sans limite de durée (ou le remettre à 30 jours). */
export async function keepMessage(id: string, keep: boolean) {
  const expires = keep ? 'infinity' : new Date(Date.now() + 30 * 864e5).toISOString();
  unwrap(await db().from('messages').update({ expires_at: expires }).eq('id', id));
}
/** Publier / retirer un témoignage (uniquement s'il y a consentement). Publier le conserve aussi. */
export async function publishMessage(id: string, publish: boolean, displayName?: string) {
  const patch: Record<string, unknown> = publish
    ? { published: true, published_at: new Date().toISOString(), expires_at: 'infinity', display_name: displayName?.trim() || null }
    : { published: false, published_at: null };
  unwrap(await db().from('messages').update(patch).eq('id', id));
}
export async function getAudioUrl(path: string): Promise<string> {
  const { data, error } = await db().storage.from('testimonies').createSignedUrl(path, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}

const toDonation = (r: any): Donation => ({
  id: r.id,
  amount: Number(r.amount),
  donorName: r.donor_name,
  donorPhone: r.donor_phone || '',
  isAnonymous: r.is_anonymous,
  method: r.method,
  status: r.status,
  transactionId: r.provider_ref || undefined,
  createdAt: r.created_at,
  campaignId: r.campaign_id || undefined,
  note: r.note || undefined,
});
export async function listDonations(): Promise<Donation[]> {
  return unwrap(await db().from('donations').select('*').order('created_at', { ascending: false }).limit(500)).map(toDonation);
}
export async function addOfflineDonation(d: { amount: number; donorName: string; isAnonymous: boolean; donorPhone?: string; method: Donation['method']; note?: string; campaignId?: string }) {
  unwrap(
    await db().from('donations').insert({
      campaign_id: d.campaignId || SCHOOL_CAMPAIGN.id,
      amount: Math.round(d.amount),
      donor_name: d.donorName.trim() || 'Anonyme',
      is_anonymous: d.isAnonymous,
      donor_phone: d.donorPhone?.trim() || null,
      method: d.method,
      note: d.note?.trim() || null,
      status: 'success',
    }),
  );
}
export async function deleteDonation(id: string) {
  unwrap(await db().from('donations').delete().eq('id', id));
}

export async function updateCampaign(id: string, patch: { title?: string; description?: string; targetAmount?: number; imageUrl?: string | null }) {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.description !== undefined) row.description = patch.description;
  if (patch.targetAmount !== undefined) row.target_amount = Math.round(patch.targetAmount);
  if (patch.imageUrl !== undefined) row.image_url = patch.imageUrl;
  unwrap(await db().from('campaigns').update(row).eq('id', id));
}

const toConversion = (r: any): ConversionRequest => ({
  id: r.id,
  name: r.name,
  phone: r.phone,
  location: r.location || '',
  method: r.method,
  status: r.status,
  createdAt: r.created_at,
});
export async function listConversionRequests(): Promise<ConversionRequest[]> {
  return unwrap(await db().from('conversion_requests').select('*').order('created_at', { ascending: false }).limit(300)).map(toConversion);
}
export async function updateConversionStatus(id: string, status: ConversionRequest['status']) {
  unwrap(await db().from('conversion_requests').update({ status }).eq('id', id));
}

export async function listAllNews(): Promise<NewsItem[]> {
  return unwrap(await db().from('news').select('*').order('created_at', { ascending: false })).map(toNews);
}
export async function saveNews(n: { id?: string; title: string; summary: string; body: string; imageUrl?: string; category: NewsItem['category']; tags?: string[] }) {
  const row = { title: n.title.trim(), summary: n.summary.trim(), body: n.body, image_url: n.imageUrl?.trim() || null, category: n.category, tags: n.tags || [] };
  if (n.id) unwrap(await db().from('news').update(row).eq('id', n.id));
  else unwrap(await db().from('news').insert(row));
}
export async function deleteNews(id: string) {
  unwrap(await db().from('news').delete().eq('id', id));
}

export async function listSubscribers(): Promise<{ email: string; createdAt: string }[]> {
  return unwrap(await db().from('newsletter_subscribers').select('email, created_at').order('created_at', { ascending: false })).map((r: any) => ({
    email: r.email,
    createdAt: r.created_at,
  }));
}

export async function getAdminCounts() {
  const c = db();
  const [apts, msgs, conv] = await Promise.all([
    c.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    c.from('messages').select('id', { count: 'exact', head: true }).eq('is_read', false).gt('expires_at', new Date().toISOString()),
    c.from('conversion_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);
  return { appointments: apts.count || 0, messages: msgs.count || 0, conversions: conv.count || 0 };
}

// ---------------------------------------------------------------------------
// Contenu du site, photos et administrateurs
// ---------------------------------------------------------------------------
export async function saveSiteContent(content: unknown) {
  unwrap(await db().from('settings').upsert({ key: 'site_content', value: content, updated_at: new Date().toISOString() }));
}

/** Envoie une photo dans l'espace public "media" et renvoie son adresse. */
export async function uploadMedia(file: File, folder: 'speakers' | 'campaign' | 'news' | 'misc'): Promise<string> {
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) throw new Error('Format accepté : JPG, PNG ou WebP.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Image trop lourde (5 Mo maximum).');
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  unwrap(await db().storage.from('media').upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false }));
  return db().storage.from('media').getPublicUrl(path).data.publicUrl;
}

export type AdminUser = { userId: string; email: string; name: string; createdAt: string };
export async function listAdmins(): Promise<AdminUser[]> {
  const data = unwrap(await db().rpc('list_admins')) as any[];
  return (data || []).map((r) => ({ userId: r.user_id, email: r.email, name: r.display_name || '', createdAt: r.created_at }));
}
export async function removeAdmin(userId: string) {
  unwrap(await db().rpc('remove_admin', { target: userId }));
}
export async function createAdmin(a: { email: string; password: string; name: string }) {
  const { data } = await db().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Session expirée, reconnectez-vous.');
  const r = await fetch('/api/admin-users', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify(a),
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body.message || 'Création impossible.');
}
export async function getMyEmail(): Promise<string> {
  const { data } = await db().auth.getSession();
  return data.session?.user?.email || '';
}
export async function changeMyPassword(password: string) {
  if (password.length < 10) throw new Error('Le mot de passe doit faire au moins 10 caractères.');
  const { error } = await db().auth.updateUser({ password });
  if (error) throw error;
}
