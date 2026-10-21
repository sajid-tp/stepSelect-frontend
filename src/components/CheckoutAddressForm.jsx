import { useState } from "react";

/*
  Inline add / edit address form used inside the checkout page.
  Same fields and rules as pages/AddressForm.jsx, so the backend accepts them.

  onSave(values) must return a promise that REJECTS with a message string on failure.
*/

const ADDRESS_TYPES = ["Home", "Work", "Other"];

const EMPTY = {
  name: "",
  phoneNumber: "",
  detailedAddress: "",
  city: "",
  pinCode: "",
  country: "India",
  addressType: "Home",
  isDefault: false,
};

const fromAddress = (address) => ({
  name: address.name || "",
  phoneNumber: address.phoneNumber || "",
  detailedAddress: address.detailedAddress || "",
  city: address.city || "",
  pinCode: address.pinCode || "",
  country: address.country || "India",
  addressType: ADDRESS_TYPES.includes(address.addressType)
    ? address.addressType
    : "Home",
  isDefault: Boolean(address.isDefault),
});

const validate = (v) => {
  const e = {};
  const name = v.name.trim();
  const street = v.detailedAddress.trim();

  if (!name) e.name = "Full name is required.";
  else if (name.length < 3 || name.length > 25)
    e.name = "Name must be 3 to 25 characters.";

  if (!v.phoneNumber.trim()) e.phoneNumber = "Mobile number is required.";
  else if (!/^\d{10}$/.test(v.phoneNumber.trim()))
    e.phoneNumber = "Enter a 10-digit mobile number.";

  if (!street) e.detailedAddress = "Street address is required.";
  else if (street.length < 10)
    e.detailedAddress = "Address must be at least 10 characters.";
  else if (street.length > 200)
    e.detailedAddress = "Address cannot exceed 200 characters.";

  if (!v.city.trim()) e.city = "City is required.";
  else if (!/^[A-Za-z\s]{2,56}$/.test(v.city.trim()))
    e.city = "Enter a valid city name.";

  if (!v.pinCode.trim()) e.pinCode = "PIN code is required.";
  else if (!/^\d{6}$/.test(v.pinCode.trim()))
    e.pinCode = "Enter a 6-digit PIN code.";

  if (!v.country.trim()) e.country = "Country is required.";
  else if (!/^[A-Za-z\s]{2,56}$/.test(v.country.trim()))
    e.country = "Enter a valid country name.";

  return e;
};

const inputClass = (hasError) => `
  h-10 w-full rounded-md border bg-[#f1f1f1] px-3 text-xs text-gray-900 outline-none
  transition placeholder:text-gray-400 focus:bg-white disabled:opacity-60
  ${
    hasError
      ? "border-red-400"
      : "border-transparent focus:border-[#b13600]"
  }
`;

function Field({ label, htmlFor, error, children, className = "" }) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-[9px] font-bold uppercase tracking-[0.12em] text-gray-500"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}

function CheckoutAddressForm({ address, onSave, onCancel, canCancel = true }) {
  const isEdit = Boolean(address);
  // the current default can only be replaced by choosing another default
  const lockedDefault = isEdit && Boolean(address.isDefault);

  const [values, setValues] = useState(address ? fromAddress(address) : EMPTY);
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const errors = validate(values);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setServerError("");
  };

  const handleBlur = (e) =>
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));

  const showError = (field) => (touched[field] ? errors[field] : "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // reveal every error on a submit attempt
    setTouched(Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setServerError("");

    try {
      await onSave({
        name: values.name.trim(),
        phoneNumber: values.phoneNumber.trim(),
        detailedAddress: values.detailedAddress.trim(),
        city: values.city.trim(),
        pinCode: values.pinCode.trim(),
        country: values.country.trim(),
        addressType: values.addressType,
        isDefault: values.isDefault,
      });
    } catch (message) {
      setServerError(
        typeof message === "string" ? message : "Could not save the address."
      );
      setSaving(false);
    }
    // on success the parent closes the form, so no need to reset `saving`
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-900">
        {isEdit ? "Edit address" : "Add a new address"}
      </p>

      {serverError && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600"
        >
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="co-name" error={showError("name")}>
          <input
            id="co-name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Full Name"
            maxLength={25}
            disabled={saving}
            className={inputClass(showError("name"))}
          />
        </Field>

        <Field
          label="Mobile number"
          htmlFor="co-phone"
          error={showError("phoneNumber")}
        >
          <input
            id="co-phone"
            name="phoneNumber"
            type="tel"
            inputMode="numeric"
            value={values.phoneNumber}
            onChange={(e) =>
              handleChange({
                target: {
                  name: "phoneNumber",
                  value: e.target.value.replace(/\D/g, "").slice(0, 10),
                },
              })
            }
            onBlur={handleBlur}
            placeholder="10-digit mobile number"
            disabled={saving}
            className={inputClass(showError("phoneNumber"))}
          />
        </Field>

        <Field
          label="Street address"
          htmlFor="co-street"
          error={showError("detailedAddress")}
          className="sm:col-span-2"
        >
          <input
            id="co-street"
            name="detailedAddress"
            value={values.detailedAddress}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="House / flat no., street, area, landmark"
            maxLength={200}
            disabled={saving}
            className={inputClass(showError("detailedAddress"))}
          />
        </Field>

        <Field label="City" htmlFor="co-city" error={showError("city")}>
          <input
            id="co-city"
            name="city"
            value={values.city}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="City"
            disabled={saving}
            className={inputClass(showError("city"))}
          />
        </Field>

        <Field label="PIN code" htmlFor="co-pin" error={showError("pinCode")}>
          <input
            id="co-pin"
            name="pinCode"
            inputMode="numeric"
            value={values.pinCode}
            onChange={(e) =>
              handleChange({
                target: {
                  name: "pinCode",
                  value: e.target.value.replace(/\D/g, "").slice(0, 6),
                },
              })
            }
            onBlur={handleBlur}
            placeholder="6-digit PIN code"
            disabled={saving}
            className={inputClass(showError("pinCode"))}
          />
        </Field>

        <Field label="Country" htmlFor="co-country" error={showError("country")}>
          <input
            id="co-country"
            name="country"
            value={values.country}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Country"
            disabled={saving}
            className={inputClass(showError("country"))}
          />
        </Field>

        <Field label="Address type" htmlFor="co-type">
          <select
            id="co-type"
            name="addressType"
            value={values.addressType}
            onChange={handleChange}
            disabled={saving}
            className={`${inputClass(false)} cursor-pointer`}
          >
            {ADDRESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          name="isDefault"
          checked={values.isDefault}
          onChange={handleChange}
          disabled={saving || lockedDefault}
          className="h-4 w-4 shrink-0 rounded accent-[#b13600]"
        />
        <span className="text-xs text-gray-600">
          {lockedDefault
            ? "This is your default address"
            : "Make this my default address"}
        </span>
      </label>

      <div className="mt-5 flex items-center justify-end gap-3">
        {canCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-md px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 transition hover:text-gray-900 disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-[#b13600] px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-[#8f2c00] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : isEdit ? "Update address" : "Save address"}
        </button>
      </div>
    </form>
  );
}

export default CheckoutAddressForm;
