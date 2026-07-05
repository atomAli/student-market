'use server';

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  deleteChatConversation,
  deleteChatMessage,
  sendChatMessage,
  createConversationForProduct as createConversationRecord,
} from "@/lib/chat";

export async function sendMessage(conversationId, formData) {
  const session = await auth();
  const content = String(formData.get("content") || "").trim();
  const result = await sendChatMessage(conversationId, content, session);
  if (result.error) return result;

  revalidatePath(`/chat/${conversationId}`);
  revalidatePath("/chat");
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${conversationId}`);

  return result;
}

export async function deleteMessage(messageId, conversationId) {
  const session = await auth();
  const result = await deleteChatMessage(messageId, session);
  if (result.error) return result;

  revalidatePath(`/chat/${conversationId}`);
  revalidatePath("/chat");
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${conversationId}`);

  return result;
}

export async function deleteConversation(conversationId) {
  const session = await auth();
  const result = await deleteChatConversation(conversationId, session);
  if (result.error) return result;

  revalidatePath("/chat");
  revalidatePath("/admin/messages");

  redirect("/admin/messages");
}

export async function createConversationForProduct(productId) {
  const session = await auth();
  const result = await createConversationRecord(productId, session);
  if (result.error) return result;

  revalidatePath("/chat");

  return result;
}
