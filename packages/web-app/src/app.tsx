// FIXME: Change route to ApmRoute once package has been updated to be
// compatible with react-router-dom v6
import React, {lazy, Suspense, useEffect} from 'react';
import {Navigate, Outlet, Route, Routes, useLocation} from 'react-router-dom';
// import ProtectedRoute from 'components/protectedRoute';
// HACK: All pages MUST be exported with the withTransaction function
// from the '@elastic/apm-rum-react' package in order for analytics to
// work properly on the pages.
import {GridLayout} from 'components/layout';
import {Loading} from 'components/temporary/loading';
import ExploreFooter from 'containers/exploreFooter';
import Footer from 'containers/footer';
import Navbar from 'containers/navbar';
import DaoSelectMenu from 'containers/navbar/daoSelectMenu';
import ExploreNav from 'containers/navbar/exploreNav';
import NetworkErrorMenu from 'containers/networkErrorMenu';
import TransferMenu from 'containers/transferMenu';
import {WalletMenu} from 'containers/walletMenu';
import {useTransactionDetailContext} from 'context/transactionDetail';
import {useVoteraProposalDetailsQuery} from 'hooks/useVoteraProposalDetails';
import {useWallet} from 'hooks/useWallet';
import {FormProvider, useForm} from 'react-hook-form';
import {identifyUser, trackPage} from 'services/analytics';
import {NotFound} from 'utils/paths';
import '../i18n.config';
import DepositModal from 'containers/transactionModals/depositModal';
import PoapClaimModal from 'containers/poapClaiming/PoapClaimModal';
import ProtectedRoute from './components/protectedRoute';

import CreateProposal from 'pages/createProposal';
const ProposalPage = lazy(() => import('pages/proposal'));
const NotFoundPage = lazy(() => import('pages/notFound'));
const DashboardPage = lazy(() => import('pages/dashboard'));
const NewProposalPage = lazy(() => import('pages/newProposal'));
function App() {
  // TODO this needs to be inside a Routes component. Will be moved there with
  // further refactoring of layout (see further below).
  const {pathname} = useLocation();
  const {methods, status, network, address, provider} = useWallet();

  useEffect(() => {
    if (status === 'connected') {
      identifyUser(address || '', network, provider?.connection.url || '');
    }
  }, [address, network, provider, status]);

  useEffect(() => {
    // This check would prevent the wallet selection modal from opening up if the user hasn't logged in previously.
    // But if the injected wallet like Metamask is locked and the user has logged in before using that wallet, there will be a prompt for password.
    if (localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER')) {
      methods.selectWallet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    trackPage(pathname);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {/* TODO: replace with loading indicator */}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/">
            <Route index element={<Navigate to="dao/dashboard" replace />} />

            <Route element={<DaoWrapper />}>
              <Route path="dao/dashboard" element={<DashboardPage />} />
              <Route element={<ProtectedRoute />}>
                <Route
                  path="dao/new-proposal/:network"
                  element={<NewProposalPage />}
                />
              </Route>
              <Route
                path="dao/proposals/:network/:id"
                element={<ProposalDetailsWrapper />}
              />
              <Route path="/create-proposal" element={<CreateProposal />} />
            </Route>
          </Route>
          <Route path={NotFound} element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundWrapper />} />
        </Routes>
      </Suspense>
      <DaoSelectMenu />
      <WalletMenu />
      <PoapClaimModal />
      <NetworkErrorMenu />
    </>
  );
}

const NewSettingsWrapper: React.FC = () => {
  const formMethods = useForm({
    mode: 'onChange',
    defaultValues: {
      links: [{name: '', url: ''}],
      startSwitch: 'now',
      durationSwitch: 'duration',
      durationDays: '1',
      durationHours: '0',
      durationMinutes: '0',
    },
  });

  return (
    <FormProvider {...formMethods}>
      <Outlet />
    </FormProvider>
  );
};

const ProposalDetailsWrapper: React.FC = () => (
    <ProposalPage />
);

const NotFoundWrapper: React.FC = () => {
  const {pathname} = useLocation();

  return <Navigate to={NotFound} state={{incorrectPath: pathname}} replace />;
};

const ExploreWrapper: React.FC = () => (
  <>
    <div className="min-h-screen">
      <ExploreNav />
      <Outlet />
    </div>
    <ExploreFooter />
  </>
);

const DaoWrapper: React.FC = () => {
  // const {data: walletDetails} = useDaoDetailsQuery();

  // using isOpen to conditionally render TransactionDetail so that
  // api call is not made on mount regardless of whether the user
  // wants to open the modal
  // const {isOpen} = useTransactionDetailContext();

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <GridLayout>
          <Outlet />
          <TransferMenu />
          <DepositModal />
        </GridLayout>
      </div>
      <Footer />
    </>
  );
};

export default App;
