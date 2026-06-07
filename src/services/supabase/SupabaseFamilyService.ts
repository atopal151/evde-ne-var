import type { SupabaseClient } from "@supabase/supabase-js";
import type { IFamilyService } from "@/services/interfaces/IFamilyService";
import type { HomeInvitation, HomeMember } from "@/types/family";

export class SupabaseFamilyService implements IFamilyService {
  constructor(private readonly client: SupabaseClient) {}

  async listMembers(): Promise<HomeMember[]> {
    const { data, error } = await this.client.rpc("get_home_members");
    if (error) throw new Error(error.message);
    return (data ?? []) as HomeMember[];
  }

  async listPendingInvitations(): Promise<HomeInvitation[]> {
    const { data, error } = await this.client.rpc("get_home_invitations");
    if (error) throw new Error(error.message);
    return (data ?? []) as HomeInvitation[];
  }

  async inviteByEmail(email: string): Promise<string> {
    const { data, error } = await this.client.rpc("send_home_invitation", {
      p_invitee_email: email.trim().toLowerCase(),
    });
    if (error) throw new Error(error.message);
    return data as string;
  }

  async respondToInvitation(invitationId: string, accept: boolean): Promise<void> {
    const { error } = await this.client.rpc("respond_home_invitation", {
      p_invitation_id: invitationId,
      p_accept: accept,
    });
    if (error) throw new Error(error.message);
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    const { error } = await this.client.rpc("cancel_home_invitation", {
      p_invitation_id: invitationId,
    });
    if (error) throw new Error(error.message);
  }
}
