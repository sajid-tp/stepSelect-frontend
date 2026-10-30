import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useReferralOffer from "../hooks/useReferralOffer";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

/*
|--------------------------------------------------------------------------
| Referral offer note
|--------------------------------------------------------------------------
| variant="compact" -> one small line under the price on a product card
| variant="full"    -> a box on the product page
|
| * A customer who signed up through a referral (and has not ordered yet) sees THEIR offer.
| * Everybody else (product page only) sees an invitation to refer friends.
*/
function ReferralOfferNote({ variant = "full" }) {
  const { program, eligible, discount, minOrderAmount } = useReferralOffer();
  const loggedIn = Boolean(useSelector((state) => state.auth?.user));

  if (!program) return null;

  if (variant === "compact") {
    if (!eligible) return null;
    return (
      <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
        <i className="fa-solid fa-gift text-[10px]" aria-hidden="true" />
        Extra {money(discount)} off your first order
      </p>
    );
  }

  if (eligible) {
    return (
      <div className="mt-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
        <i className="fa-solid fa-gift mt-0.5 text-emerald-600" aria-hidden="true" />
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-emerald-800">Referral offer unlocked</p>
          <p className="mt-0.5 text-emerald-700">
            Get {money(discount)} off your first order of {money(minOrderAmount)} or more. It is applied
            automatically at checkout.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 flex items-start gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3">
      <i className="fa-solid fa-user-plus mt-0.5 text-[#f4511e]" aria-hidden="true" />
      <div className="min-w-0 text-sm">
        <p className="font-semibold text-gray-900">Refer a friend, earn {money(program.referrerReward)}</p>
        <p className="mt-0.5 text-gray-600">
          Your friend gets {money(program.referredDiscount)} off their first order of{" "}
          {money(program.minOrderAmount)}+, and you get {money(program.referrerReward)} in your wallet once it is
          delivered.{" "}
          <Link to={loggedIn ? "/profile" : "/signup"} className="font-semibold text-[#f4511e] underline">
            {loggedIn ? "Get your code" : "Sign up"}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ReferralOfferNote;
