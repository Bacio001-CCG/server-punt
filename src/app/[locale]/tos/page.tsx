import { LegalDocument } from "../../components/legal-document";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function TOS() {
    return <LegalDocument namespace="tos" />;
}
