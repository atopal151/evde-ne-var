import type { HomeInvitation, HomeMember } from "@/types/family";

export interface IFamilyService {
  listMembers(): Promise<HomeMember[]>;
  listPendingInvitations(): Promise<HomeInvitation[]>;
  inviteByEmail(email: string): Promise<string>;
  respondToInvitation(invitationId: string, accept: boolean): Promise<void>;
  cancelInvitation(invitationId: string): Promise<void>;
}
