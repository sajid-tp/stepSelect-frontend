import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AccountSidebar from '../components/AccountSideBar';
import { fetchUserProfile } from '../features/user/accountSlice';

function AccountOverview() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.account.profile);
  const status = useSelector((state) => state.account.status);
  const error = useSelector((state) => state.account.error);

  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    setImgError(false);
  }, [profile?.profileImage]);

  const userInitial = profile?.username?.charAt(0).toUpperCase() || 'U';
  const hasValidImage = profile?.profileImage && !imgError;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Full width container with standard side padding so it aligns with navbar/footer */}
      <main className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 flex-1 py-6 md:py-8">
        
        {/* Breadcrumb pinned to the left */}
        <p className="text-xs text-muted mb-4 md:mb-6 tracking-wide uppercase">
          Home / Account / <span className="font-semibold text-ink">Profile</span>
        </p>

        {/* Flex layout: Sidebar sticks to the left, content flows right */}
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
          
          {/* Sidebar on the far left with a fixed desktop width */}
          <aside className="w-full lg:w-[280px] shrink-0">
            <AccountSidebar />
          </aside>

          {/* Profile Content Area */}
          <section className="flex-1 w-full min-w-0">
            
            <h1 className="text-xl sm:text-2xl font-bold mb-6">
              Account <span className="text-[#f4511e]">Overview</span>
            </h1>

            {/* Profile Card: max-w-3xl prevents it from stretching endlessly on ultra-wide screens */}
            <div className="w-full max-w-3xl rounded-xl border border-line p-5 sm:p-7 bg-white shadow-xs">
              
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 border-b border-line pb-4 mb-6">
                <span className="text-xs font-bold tracking-wider uppercase text-muted">
                  Personal Details
                </span>
                <Link
                  to="/profile/edit"
                  className="flex items-center gap-1.5 py-1 text-xs font-semibold text-[#f4511e] hover:underline"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Profile
                </Link>
              </div>

              {/* Loading & Error States */}
              {status === 'loading' && !profile && (
                <p className="text-sm text-muted py-2">Loading your details...</p>
              )}

              {status === 'failed' && !profile && (
                <p className="text-sm text-red-600 py-2">
                  Couldn't load your profile{error ? `: ${error}` : '.'} Try refreshing the page.
                </p>
              )}

              {/* Profile details */}
              {profile && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {hasValidImage ? (
                      <img
                        src={profile.profileImage}
                        alt={profile.username || 'Profile'}
                        onError={() => setImgError(true)}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border border-line shadow-xs"
                      />
                    ) : (
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#f4511e] flex items-center justify-center text-white font-bold text-2xl shadow-xs">
                        {userInitial}
                      </div>
                    )}
                  </div>

                  {/* Grouped Name and Email together */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 flex-1 min-w-0">
                    <div>
                      <span className="text-[11px] text-muted block uppercase tracking-wider font-semibold mb-0.5">
                        Name
                      </span>
                      <p className="text-sm font-semibold text-ink break-words">
                        {profile.username || '—'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-muted block uppercase tracking-wider font-semibold mb-0.5">
                        Email
                      </span>
                      <p className="text-sm font-semibold text-ink break-all">
                        {profile.email || '—'}
                      </p>
                    </div>

                    {profile.phoneNumber && (
                      <div className="sm:col-span-2">
                        <span className="text-[11px] text-muted block uppercase tracking-wider font-semibold mb-0.5">
                          Phone Number
                        </span>
                        <p className="text-sm font-semibold text-ink break-words">
                          {profile.phoneNumber}
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AccountOverview;