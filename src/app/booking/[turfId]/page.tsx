import { redirect } from "next/navigation";

export default function BookingRedirectPage({ params }: { params: { turfId: string } }) {
  redirect(`/turfs/${params.turfId}`);
}
