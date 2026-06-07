export type HomeMemberRole = "owner" | "member";

export type InvitationStatus = "pending" | "accepted" | "rejected" | "cancelled";

export type InvitationDirection = "incoming" | "outgoing";

export interface HomeMember {
  user_id: string;
  full_name: string;
  email: string;
  role: HomeMemberRole;
  joined_at: string;
}

export interface HomeInvitation {
  id: string;
  home_id: string;
  home_name: string;
  inviter_id: string;
  inviter_name: string;
  invitee_email: string;
  status: InvitationStatus;
  direction: InvitationDirection;
  created_at: string;
}
