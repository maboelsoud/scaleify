
interface BusinessUser {
  phoneNumber: string;
  email: string;
  name: string;
}

export interface Business {
  primaryEmail: string; // primary key
  twilioIncomingPhoneNumber: string;
  operatorPhoneNumber: string;
  name: string;
  businessInfo: Record<string, string>;
  admins: BusinessUser[];
}

export function createBusiness(
  email: string,
  twilioNumber: string,
  operator: string,
  name: string,
): Business {
  return {
    primaryEmail: email,
    twilioIncomingPhoneNumber: twilioNumber,
    operatorPhoneNumber: operator,
    name,
    businessInfo: {},
    admins: [],
  };
}


export function addBusinessUser(business: Business, user: BusinessUser): void {
  if (!business.admins.find(x=> x.email === user.email)) {
    business.admins.push(user)
  }
}