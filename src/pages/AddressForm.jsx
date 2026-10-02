import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FormField from '../components/FormField';
import { addAddress, updateAddress, fetchAddresses } from '../features/user/addressSlice';

function AddressForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const existingAddress = useSelector((state) =>
    state.address?.list?.find((a) => a.id === id || a._id === id)
  );

  const [form, setForm] = useState({
    name: '',
    addressType: '',
    detailedAddress: '',
    country: '',
    city: '',
    pinCode: '',
    phoneNumber: '',
    email: '',
    isDefault: false,
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!existingAddress && id) {
      dispatch(fetchAddresses());
    }
  }, [dispatch, existingAddress, id]);

  useEffect(() => {
    if (existingAddress) {
      setForm({
        name: existingAddress.name || '',
        addressType: existingAddress.addressType || '',
        detailedAddress: existingAddress.detailedAddress || '',
        country: existingAddress.country || '',
        city: existingAddress.city || '',
        pinCode: existingAddress.pinCode || '',
        phoneNumber: existingAddress.phoneNumber || existingAddress.phone || '',
        email: existingAddress.email || '',
        isDefault: existingAddress.isDefault || false,
      });
    }
  }, [existingAddress]);

  // ✅ Validation logic — returns an errors object based on current form values
  const validate = (values) => {
    const newErrors = {};

    if (!values.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (values.name.trim().length < 3 || values.name.trim().length > 50) {
      newErrors.name = 'Name must be between 3 and 50 characters';
    }

    if (!values.detailedAddress.trim()) {
      newErrors.detailedAddress = 'Detailed address is required';
    } else if (values.detailedAddress.trim().length < 10) {
      newErrors.detailedAddress = 'Address must be at least 10 characters';
    }

    const allowedTypes = ['Home', 'Work', 'Other'];
    if (!values.addressType.trim()) {
      newErrors.addressType = 'Address type is required';
    } else if (!allowedTypes.includes(values.addressType.trim())) {
      newErrors.addressType = 'Address type must be Home, Work, or Other';
    }

    if (!values.country.trim()) {
      newErrors.country = 'Country is required';
    } else if (!/^[A-Za-z\s]{2,56}$/.test(values.country.trim())) {
      newErrors.country = 'Enter a valid country name';
    }

    if (!values.city.trim()) {
      newErrors.city = 'City is required';
    } else if (!/^[A-Za-z\s]{2,56}$/.test(values.city.trim())) {
      newErrors.city = 'Enter a valid city name';
    }

    if (!values.pinCode.trim()) {
      newErrors.pinCode = 'PIN code is required';
    } else if (!/^\d{4,10}$/.test(values.pinCode.trim())) {
      newErrors.pinCode = 'Enter a valid PIN code';
    }

    if (!values.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(values.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Phone number must be 10–15 digits';
    }

    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    return newErrors;
  };

  // ✅ Re-run validation live, whenever form changes
  useEffect(() => {
    setErrors(validate(form));
  }, [form]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Mark every field as touched so all errors show on submit attempt
    const allTouched = Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return; // stop submission if there are errors
    }

    setIsSubmitting(true);

    try {
      const action = isEditing
        ? updateAddress({ id, ...form })
        : addAddress(form);

      await dispatch(action).unwrap();
      navigate('/profile/addresses');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfb]">
      <Navbar />

      {/* px-4 keeps the card off the screen edges on phones */}
      <main className="container flex-1 w-full max-w-lg mx-auto px-4 sm:px-0 py-6 sm:py-10">
        <div className="mb-4">
          <Link
            to="/profile/addresses"
            className="inline-flex items-center gap-1 py-1 text-xs font-semibold text-muted hover:text-ink uppercase tracking-wider"
          >
            ← Back to Addresses
          </Link>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 sm:p-8 shadow-xs">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">
            {isEditing ? 'Edit' : 'Add New'}{' '}
            <span className="text-[#f4511e]">Address</span>
          </h1>
          <p className="text-xs text-muted mb-5 sm:mb-6">
            Please provide your delivery details below.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <FormField
              label="Name"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.name && errors.name && (
              <p className="text-xs text-red-600 -mt-4 mb-4">{errors.name}</p>
            )}

            <FormField
              label="Address Type"
              name="addressType"
              placeholder="e.g., Home, Work, Other"
              value={form.addressType}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.addressType && errors.addressType && (
              <p className="text-xs text-red-600 -mt-4 mb-4">{errors.addressType}</p>
            )}

            <div className="mb-5">
              <label
                htmlFor="detailedAddress"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Detailed Address
              </label>
              {/* text-base on phones stops iOS Safari from zooming in on focus */}
              <textarea
                id="detailedAddress"
                name="detailedAddress"
                rows={3}
                placeholder="Street address, apartment, suite, unit etc."
                value={form.detailedAddress}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full rounded-md border border-line px-4 py-3 text-base sm:text-sm outline-none focus:border-ink resize-none"
              />
              {touched.detailedAddress && errors.detailedAddress && (
                <p className="text-xs text-red-600 mt-1">{errors.detailedAddress}</p>
              )}
            </div>

            {/* One column on phones, two from 640px up (card is max-w-lg, so sm is the right breakpoint) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
              <div className="min-w-0">
                <FormField
                  label="Country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.country && errors.country && (
                  <p className="text-xs text-red-600 -mt-4 mb-4">{errors.country}</p>
                )}
              </div>
              <div className="min-w-0">
                <FormField
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.city && errors.city && (
                  <p className="text-xs text-red-600 -mt-4 mb-4">{errors.city}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
              <div className="min-w-0">
                <FormField
                  label="PIN Code"
                  name="pinCode"
                  inputMode="numeric"
                  value={form.pinCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.pinCode && errors.pinCode && (
                  <p className="text-xs text-red-600 -mt-4 mb-4">{errors.pinCode}</p>
                )}
              </div>
              <div className="min-w-0">
                <FormField
                  label="Phone Number"
                  name="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.phoneNumber && errors.phoneNumber && (
                  <p className="text-xs text-red-600 -mt-4 mb-4">{errors.phoneNumber}</p>
                )}
              </div>
            </div>

            <FormField
              label="Email Address (Optional)"
              name="email"
              type="email"
              placeholder="johndoe@example.com"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.email && errors.email && (
              <p className="text-xs text-red-600 -mt-4 mb-4">{errors.email}</p>
            )}

            <label className="flex items-center gap-2.5 mb-6 cursor-pointer py-1">
              <input
                type="checkbox"
                name="isDefault"
                checked={form.isDefault}
                onChange={handleChange}
                className="h-5 w-5 sm:h-4 sm:w-4 shrink-0 rounded border-line accent-[#f4511e]"
              />
              <span className="text-xs text-muted">Set as default delivery address</span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-ink py-3.5 sm:py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2"
            >
              🔒 {isSubmitting ? 'Saving Address...' : 'Save Address'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AddressForm;
