"use client";

export type OrgSettings = {
  name: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  tagline: string | null;
  primary: string;
  report_header: {
    logo_alignment: "left" | "center" | "right";
    show_address: boolean;
    show_phone: boolean;
    show_email: boolean;
    show_tagline: boolean;
  };
};

export function ReportHeader({ org }: { org: OrgSettings }) {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[org.report_header.logo_alignment];

  return (
    <div
      className={`mb-6 pb-4 border-b-2 ${alignClass}`}
      style={{ borderBottomColor: org.primary }}
    >
      {org.logo_url && (
        <img
          src={org.logo_url}
          alt={org.name}
          className="h-12 object-contain mb-2 inline-block"
        />
      )}
      <h1 className="text-xl font-bold text-gray-900">{org.name}</h1>
      {org.report_header.show_address && org.address && (
        <p className="text-sm text-gray-600">{org.address}</p>
      )}
      {(org.report_header.show_phone || org.report_header.show_email) && (
        <p className="text-sm text-gray-600">
          {org.report_header.show_phone && org.phone && org.phone}
          {org.report_header.show_phone &&
            org.report_header.show_email &&
            org.phone &&
            org.email &&
            " · "}
          {org.report_header.show_email && org.email && org.email}
        </p>
      )}
      {org.report_header.show_tagline && org.tagline && (
        <p className="text-sm italic text-gray-500">{org.tagline}</p>
      )}
    </div>
  );
}
