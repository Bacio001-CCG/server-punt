import { LegalDocument } from "../../components/legal-document";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function CookiePolicy() {
    return <LegalDocument namespace="cookiePolicy" />;
}
