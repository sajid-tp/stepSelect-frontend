import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AccountSidebar from '../components/AccountSideBar';
import ReferralCard from '../components/ReferralCard';
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

      <main className="w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 xl:px-10 2xl:px-16">
        
        <div className="grid gap-6 lg:grid-cols-[256px_minmax(0,1fr)] lg:items-start xl:gap-8">
          <AccountSidebar />

          <section className="min-w-0">
            <nav className="mb-4 text-xs uppercase tracking-wide md:mb-6">
              <Link to="/" className="text-muted transition hover:text-ink">
                Home
              </Link>
              <span className="mx-2 text-muted">/</span>
              <Link to="/profile" className="text-muted transition hover:text-ink">
                Account
              </Link>
              <span className="mx-2 text-muted">/</span>
              <span className="font-semibold text-ink">Profile</span>
            </nav>

            <h1 className="mb-5 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Account <span className="text-[#f4511e]">Overview</span>
            </h1>

            <div className="w-full rounded-xl border border-line bg-white p-5 shadow-xs sm:p-7">
              
              <div className="flex items-center justify-between gap-2 border-b border-line pb-4 mb-6">
                <span className="text-sm font-bold tracking-wider uppercase text-muted">
                  Personal Details
                </span>
                <Link
                  to="/profile/edit"
                  className="flex items-center gap-1.5 py-1 text-sm font-semibold text-[#f4511e] hover:underline"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Profile
                </Link>
              </div>

              {status === 'loading' && !profile && (
                <p className="text-base text-muted py-2">Loading your details...</p>
              )}

              {status === 'failed' && !profile && (
                <p className="text-sm text-red-600 py-2">
                  Couldn't load your profile{error ? `: ${error}` : '.'} Try refreshing the page.
                </p>
              )}

              {profile && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
                  
                  <div className="relative shrink-0">
                    {hasValidImage ? (
                      <img
                        src={profile.profileImage}
                        alt={profile.username || 'Profile'}
                        onError={() => setImgError(true)}
                        className="h-20 w-20 sm:h-28 sm:w-28 rounded-2xl object-cover border border-line shadow-xs"
                      />
                    ) : (
                      <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-2xl bg-[#f4511e] flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-xs">
                        {userInitial}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 flex-1 min-w-0">
                    <div>
                      <span className="text-xs text-muted block uppercase tracking-wider font-semibold mb-1">
                        Name
                      </span>
                      <p className="text-base font-semibold text-ink break-words">
                        {profile.username || '—'}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-muted block uppercase tracking-wider font-semibold mb-1">
                        Email
                      </span>
                      <p className="text-base font-semibold text-ink break-all">
                        {profile.email || '—'}
                      </p>
                    </div>

                    {profile.phoneNumber && (
                      <div className="sm:col-span-2">
                        <span className="text-xs text-muted block uppercase tracking-wider font-semibold mb-1">
                          Phone Number
                        </span>
                        <p className="text-base font-semibold text-ink break-words">
                          {profile.phoneNumber}
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            <ReferralCard />
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AccountOverview;