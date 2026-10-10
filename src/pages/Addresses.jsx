import { useSelector, useDispatch } from 'react-redux';
import { useEffect,useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AccountSidebar from '../components/AccountSideBar';
import { fetchAddresses, deleteAddress } from '../features/user/addressSlice';
import Modal from '../components/Modals';


function Addresses() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: addresses, status } = useSelector((state) => state.address);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchAddresses());
  }, [status, dispatch]);

// Opens the confirmation modal
const handleDelete = (id) => {
  setSelectedAddressId(id);
  setShowDeleteModal(true);
};

// Deletes only after confirmation
const handleDeleteAddress = async () => {
  if (!selectedAddressId) return;

  setIsDeleting(true);

  try {
    await dispatch(deleteAddress(selectedAddressId)).unwrap();

    setShowDeleteModal(false);
    setSelectedAddressId(null);
  } catch (error) {
    console.error('Failed to delete address:', error);
  } finally {
    setIsDeleting(false);
  }
};

const [showDeleteModal, setShowDeleteModal] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
const [selectedAddressId, setSelectedAddressId] = useState(null);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Main container matching the Profile layout */}
      <main className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 flex-1 py-6 md:py-8">
        
        {/* Breadcrumb pinned to the left */}
        <p className="text-xs text-muted mb-4 md:mb-6 tracking-wide uppercase">
          Home / Account / <span className="font-semibold text-ink">Addresses</span>
        </p>

        {/* Responsive flex layout: Sidebar on the left, content flows right */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
          
          {/* Sidebar on the far left */}
          <aside className="w-full lg:w-[280px] shrink-0">
            <AccountSidebar />
          </aside>

          {/* Addresses Content Area */}
          <section className="flex-1 w-full min-w-0">
            
            {/* Header & Add Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h1 className="text-xl sm:text-2xl font-bold">
                My <span className="text-[#f4511e]">Addresses</span>
              </h1>
              <Link
                to="/profile/addresses/new"
                className="rounded-md bg-[#f4511e] px-4 py-2.5 sm:py-2 text-xs font-bold uppercase text-white shadow-sm hover:opacity-90 transition whitespace-nowrap"
              >
                + Add New
              </Link>
            </div>

            {/* Address Cards Container: max-w-4xl prevents cards from over-stretching on wide viewports */}
            <div className="w-full max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`rounded-xl border p-4 sm:p-5 bg-white transition relative min-w-0 flex flex-col justify-between ${
                      addr.isDefault
                        ? 'border-[#f4511e] shadow-xs ring-1 ring-[#f4511e]/20'
                        : 'border-line'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-7 w-7 shrink-0 rounded-full bg-orange-100 flex items-center justify-center text-xs text-[#f4511e]">
                            {addr.addressType === 'Home' ? '🏠' : '💼'}
                          </div>
                          <span className="font-bold text-sm text-ink truncate">{addr.addressType}</span>
                        </div>
                        {addr.isDefault && (
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-[#f4511e] text-white px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-muted leading-relaxed break-words">{addr.detailedAddress}</p>
                      <p className="text-xs text-muted leading-relaxed mb-5 break-words">
                        {addr.city}, {addr.country} - {addr.pinCode}
                      </p>
                    </div>

                    <div className="border-t border-line/60 pt-3 flex items-center gap-5 text-xs font-bold uppercase mt-auto">
                      <button
                        onClick={() => navigate(`/profile/addresses/edit/${addr._id}`)}
                        className="py-1 text-muted hover:text-ink flex items-center gap-1 transition"
                      >
                        ✎ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(addr._id)}
                        className="py-1 text-[#f4511e] hover:underline flex items-center gap-1 transition"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {addresses.length === 0 && status !== 'loading' && (
                <p className="text-sm text-muted">
                  You haven't added any addresses yet. Tap "+ Add New" to add one.
                </p>
              )}
            </div>

          </section>

        </div>
      </main>

      <Footer />
      <Modal
  open={showDeleteModal}
  title="Delete Address"
  message="Are you sure you want to delete this address? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={handleDeleteAddress}
  onClose={() => setShowDeleteModal(false)}
  loading={isDeleting}
  variant="danger"
/>
    </div>
  );
}

export default Addresses;