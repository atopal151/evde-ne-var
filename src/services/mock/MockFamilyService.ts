import type { IFamilyService } from "@/services/interfaces/IFamilyService";
import type { HomeInvitation, HomeMember } from "@/types/family";

const MEMBERS_KEY = "nepisirsem-family-members";
const INVITATIONS_KEY = "nepisirsem-family-invitations";

function readMembers(): HomeMember[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    return raw ? (JSON.parse(raw) as HomeMember[]) : [];
  } catch {
    return [];
  }
}

function writeMembers(members: HomeMember[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

function readInvitations(): HomeInvitation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INVITATIONS_KEY);
    return raw ? (JSON.parse(raw) as HomeInvitation[]) : [];
  } catch {
    return [];
  }
}

function writeInvitations(invitations: HomeInvitation[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(INVITATIONS_KEY, JSON.stringify(invitations));
}

export class MockFamilyService implements IFamilyService {
  constructor(private readonly currentUserEmail = "demo@nepisirsem.app") {}

  async listMembers(): Promise<HomeMember[]> {
    const stored = readMembers();
    if (stored.length > 0) return stored;

    const defaults: HomeMember[] = [
      {
        user_id: "demo-owner",
        full_name: "Demo Kullanıcı",
        email: this.currentUserEmail,
        role: "owner",
        joined_at: new Date().toISOString(),
      },
    ];
    writeMembers(defaults);
    return defaults;
  }

  async listPendingInvitations(): Promise<HomeInvitation[]> {
    return readInvitations().filter((i) => i.status === "pending");
  }

  async inviteByEmail(email: string): Promise<string> {
    const normalized = email.trim().toLowerCase();
    if (!normalized.includes("@")) {
      throw new Error("Geçerli bir e-posta girin");
    }
    if (normalized === this.currentUserEmail.toLowerCase()) {
      throw new Error("Kendinizi davet edemezsiniz");
    }

    const members = await this.listMembers();
    if (members.some((m) => m.email.toLowerCase() === normalized)) {
      throw new Error("Bu kişi zaten mutfağınızda");
    }

    const invitations = readInvitations();
    if (
      invitations.some(
        (i) =>
          i.status === "pending" &&
          i.invitee_email.toLowerCase() === normalized &&
          i.direction === "outgoing"
      )
    ) {
      throw new Error("Bu kişiye zaten davet gönderildi");
    }

    const id = `invite-${Date.now()}`;
    const invitation: HomeInvitation = {
      id,
      home_id: "demo-home",
      home_name: "Demo Mutfak",
      inviter_id: "demo-owner",
      inviter_name: "Demo Kullanıcı",
      invitee_email: normalized,
      status: "pending",
      direction: "outgoing",
      created_at: new Date().toISOString(),
    };

    writeInvitations([invitation, ...invitations]);
    return id;
  }

  async respondToInvitation(invitationId: string, accept: boolean): Promise<void> {
    const invitations = readInvitations();
    const index = invitations.findIndex((i) => i.id === invitationId);
    if (index === -1) throw new Error("Davet bulunamadı");

    if (!accept) {
      invitations[index] = {
        ...invitations[index],
        status: "rejected",
      };
      writeInvitations(invitations);
      return;
    }

    const invite = invitations[index];
    const members = await this.listMembers();
    members.push({
      user_id: `member-${Date.now()}`,
      full_name: invite.invitee_email.split("@")[0],
      email: invite.invitee_email,
      role: "member",
      joined_at: new Date().toISOString(),
    });
    writeMembers(members);

    invitations[index] = { ...invite, status: "accepted" };
    writeInvitations(invitations);
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    const invitations = readInvitations();
    const index = invitations.findIndex((i) => i.id === invitationId);
    if (index === -1) throw new Error("Davet iptal edilemedi");

    invitations[index] = {
      ...invitations[index],
      status: "cancelled",
    };
    writeInvitations(invitations);
  }
}
