import { supabase } from './supabase';
import { Document, ChatMessage, Settings, Locale, CountryCode, ImmigrationStatus, MAX_FREE_SCANS } from './types';
import { getUser } from './auth';

// ==================== PROFILE ====================

export async function getProfile() {
  const user = await getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}

export async function updateProfile(updates: {
  language?: string;
  country?: string;
  status?: string;
  scan_count?: number;
}) {
  const user = await getUser();
  if (!user) return;

  await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id);
}

// ==================== DOCUMENTS ====================

export async function getDocumentsFromDb(): Promise<Document[]> {
  const user = await getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!data) return [];

  // Load chat messages for each document
  const docIds = data.map((d: any) => d.id);
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*')
    .in('document_id', docIds)
    .order('created_at', { ascending: true });

  const messagesByDoc: Record<string, ChatMessage[]> = {};
  if (messages) {
    for (const msg of messages) {
      if (!messagesByDoc[msg.document_id]) messagesByDoc[msg.document_id] = [];
      messagesByDoc[msg.document_id].push({
        role: msg.role,
        content: msg.content,
        timestamp: msg.created_at,
      });
    }
  }

  return data.map((d: any) => ({
    id: d.id,
    createdAt: d.created_at,
    title: d.title,
    category: d.category,
    status: d.status,
    whatIsThis: d.what_is_this || '',
    whatItSays: d.what_it_says || '',
    whatToDo: d.what_to_do || [],
    deadline: d.deadline,
    deadlineDescription: d.deadline_description,
    urgency: d.urgency || 'none',
    urgencyReason: d.urgency_reason,
    amounts: d.amounts || [],
    imageData: d.image_url || '',
    chatHistory: messagesByDoc[d.id] || [],
    language: d.language || 'fr',
    confidence: d.confidence,
    documentCountry: d.document_country,
    recommendations: d.recommendations || [],
  }));
}

export async function getDocumentFromDb(id: string): Promise<Document | null> {
  const user = await getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!data) return null;

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('document_id', id)
    .order('created_at', { ascending: true });

  return {
    id: data.id,
    createdAt: data.created_at,
    title: data.title,
    category: data.category,
    status: data.status,
    whatIsThis: data.what_is_this || '',
    whatItSays: data.what_it_says || '',
    whatToDo: data.what_to_do || [],
    deadline: data.deadline,
    deadlineDescription: data.deadline_description,
    urgency: data.urgency || 'none',
    amounts: data.amounts || [],
    imageData: data.image_url || '',
    chatHistory: (messages || []).map((m: any) => ({
      role: m.role,
      content: m.content,
      timestamp: m.created_at,
    })),
    language: data.language || 'fr',
    recommendations: data.recommendations || [],
  };
}

export async function addDocumentToDb(doc: Document): Promise<string> {
  const user = await getUser();
  if (!user) throw new Error('Not authenticated');

  // Upload image to storage if present
  let imageUrl = '';
  if (doc.imageData && doc.imageData.startsWith('data:')) {
    imageUrl = await uploadImage(user.id, doc.id, doc.imageData);
  }

  const { error } = await supabase.from('documents').insert({
    id: doc.id,
    user_id: user.id,
    title: doc.title,
    category: doc.category,
    status: doc.status,
    what_is_this: doc.whatIsThis,
    what_it_says: doc.whatItSays,
    what_to_do: doc.whatToDo,
    deadline: doc.deadline,
    deadline_description: doc.deadlineDescription,
    urgency: doc.urgency,
    amounts: doc.amounts,
    image_url: imageUrl,
    language: doc.language,
    recommendations: doc.recommendations,
  });

  if (error) throw error;
  return doc.id;
}

export async function updateDocumentInDb(id: string, updates: Partial<Document>) {
  const user = await getUser();
  if (!user) return;

  const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.title) dbUpdates.title = updates.title;

  await supabase.from('documents').update(dbUpdates).eq('id', id).eq('user_id', user.id);
}

export async function addChatMessage(documentId: string, role: 'user' | 'assistant', content: string) {
  const user = await getUser();
  if (!user) return;

  await supabase.from('chat_messages').insert({
    document_id: documentId,
    user_id: user.id,
    role,
    content,
  });
}

export async function deleteDocumentFromDb(id: string) {
  const user = await getUser();
  if (!user) return;

  await supabase.from('documents').delete().eq('id', id).eq('user_id', user.id);
}

// ==================== SCAN COUNTER ====================

export async function incrementScanCountDb(): Promise<number> {
  const profile = await getProfile();
  if (!profile) return 0;

  const newCount = (profile.scan_count || 0) + 1;
  await updateProfile({ scan_count: newCount });
  return newCount;
}

export async function canScanDb(): Promise<boolean> {
  const profile = await getProfile();
  if (!profile) return false;
  if (profile.plan === 'pro') return true;
  return (profile.scan_count || 0) < MAX_FREE_SCANS;
}

export async function getScanCountDb(): Promise<number> {
  const profile = await getProfile();
  return profile?.scan_count || 0;
}

// ==================== IMAGE STORAGE ====================

async function uploadImage(userId: string, docId: string, dataUrl: string): Promise<string> {
  const base64 = dataUrl.split(',')[1];
  if (!base64) return '';

  const mime = dataUrl.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
  const ext = mime.split('/')[1] || 'jpg';
  const path = `${userId}/${docId}.${ext}`;

  const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  const { error } = await supabase.storage
    .from('documents')
    .upload(path, buffer, { contentType: mime, upsert: true });

  if (error) {
    console.error('Upload error:', error);
    return '';
  }

  const { data } = supabase.storage.from('documents').getPublicUrl(path);
  return data.publicUrl;
}

// ==================== MIGRATION ====================

export async function migrateFromLocalStorage() {
  const user = await getUser();
  if (!user) return;

  // Check if already migrated
  const { data: existingDocs } = await supabase
    .from('documents')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);

  if (existingDocs && existingDocs.length > 0) return; // Already has data

  // Get local data
  const localDocs = localStorage.getItem('doclear_documents');
  const localSettings = localStorage.getItem('doclear_settings');

  if (localSettings) {
    try {
      const settings = JSON.parse(localSettings);
      await updateProfile({
        language: settings.language,
        country: settings.country,
        status: settings.status,
        scan_count: settings.scanCount || 0,
      });
    } catch {}
  }

  if (localDocs) {
    try {
      const docs: Document[] = JSON.parse(localDocs);
      for (const doc of docs) {
        await addDocumentToDb(doc);
        // Migrate chat messages
        if (doc.chatHistory && doc.chatHistory.length > 0) {
          for (const msg of doc.chatHistory) {
            await addChatMessage(doc.id, msg.role, msg.content);
          }
        }
      }
    } catch (e) {
      console.error('Migration error:', e);
    }
  }

  // Clear localStorage after successful migration
  localStorage.removeItem('doclear_documents');
  localStorage.removeItem('doclear_settings');
  localStorage.removeItem('doclear_onboarding_done');
}
