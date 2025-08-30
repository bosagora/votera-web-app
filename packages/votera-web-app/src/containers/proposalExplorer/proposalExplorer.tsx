import {
  ButtonGroup,
  ButtonText,
  IconChevronDown,
  Option,
  Spinner,
} from 'votera-ui-components';
import React, {useEffect, useMemo, useState} from 'react';
import {TFunction, useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {ProposalCard} from 'components/proposalCard';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA, getSupportedNetworkByChainId} from 'utils/constants';
import {Dashboard} from 'utils/paths';
import {useProposalQuery, PROPOSALS_PER_PAGE} from 'hooks/useProposalQuery';
import useScreen from '../../hooks/useScreen';
import {useClient} from '../../hooks/useClient';
import {ProposalData} from 'votera-sdk-client';
import {useNetwork} from '../../context/network';
import {shortenAddress} from '../../utils/library';
import {getExtendedPhase} from '../../pages/dashboard';

export const ProposalExplorer = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {address} = useWallet();
  const {network} = useNetwork();
  const {isDesktop} = useScreen();
  const {client} = useClient();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [proposalList, setProposalList] = useState<Array<ProposalData>>([]);
  const proposalQuery = useProposalQuery(undefined, page) || {
    data: [],
    error: null,
    isLoading: false,
  };

  const [proposalLength, setProposalLength] = useState<number>(0);

  useEffect(() => {
    const fetchProposalLength = async () => {
      if (client) {
        try {
          const length = await client.methods.getProposalLength();
          console.log(`ProposalExplorer - length: ${length}`);
          setProposalLength(length);
          if (length > 0) {
            setPage(1);
          }
        } catch (error) {
          console.error('제안서 개수 조회 중 오류 발생:', error);
          setProposalLength(0);
        }
      }
    };

    fetchProposalLength();
  }, [client]);

  useEffect(() => {
    if (proposalQuery.data) {
      const newProposals = proposalQuery.data as Array<ProposalData>;

      if (newProposals.length < PROPOSALS_PER_PAGE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (page === 1) {
        setProposalList(newProposals);
      } else {
        setProposalList(prev => {
          const uniqueProposals = newProposals.filter(
            newProposal =>
              !prev.some(p => p.proposalId === newProposal.proposalId)
          );
          return [...prev, ...uniqueProposals];
        });
      }
    }
  }, [proposalQuery.data, page]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const getInProgressPhase = (proposal: any, t: TFunction) => {
    const extendedPhase = getExtendedPhase(proposal);
    if (extendedPhase.toLowerCase().includes('opened')) {
      return t('governance.statusWidget.active');
    } else if (extendedPhase.toLowerCase().includes('closed')) {
      return t('governance.statusWidget.finished');
    }
  };

  /*************************************************
   *                     Render                    *
   *************************************************/
  return (
    <Container>
      <MainContainer>
        <HeaderWrapper>
          <Title>{t('explore.explorer.title')}</Title>
        </HeaderWrapper>
        <CardsWrapper>
          {proposalQuery.isLoading ? (
            <Spinner size="default" />
          ) : (
            proposalList.map((p: ProposalData) => (
              <ProposalCard
                proposalId={p.proposalId}
                proposalType={p.proposalType}
                fundAmount={p.fundAmount}
                title={p.title}
                description={p.description}
                key={p.proposalId}
                phase={p.period}
                blockchain={
                  CHAIN_METADATA[
                    getSupportedNetworkByChainId(p.chain) || 'unsupported'
                  ].name
                }
                explorer={
                  CHAIN_METADATA[
                    getSupportedNetworkByChainId(p.chain) || 'unsupported'
                  ].explorer
                }
                publisherAddress={p.proposer}
                addressLabel={
                  p.proposer.toLowerCase() === address?.toLowerCase()
                    ? t('labels.you') +
                      ` (` +
                      shortenAddress(p.proposer || '') +
                      ')'
                    : shortenAddress(p.proposer || '')
                }
                progressLabel={getInProgressPhase(p, t)}
                onClick={() => {
                  navigate(
                    generatePath(Dashboard, {
                      network,
                      id: p.proposalId,
                    })
                  );
                }}
              />
            ))
          )}
        </CardsWrapper>
      </MainContainer>
      {hasMore && (
        <div>
          <ButtonText
            css={{}}
            label={t('explore.explorer.showMore')}
            iconRight={
              proposalQuery.isLoading ? (
                <Spinner size="xs" />
              ) : (
                <IconChevronDown />
              )
            }
            bgWhite
            mode="ghost"
            onClick={() => handleLoadMore()}
          />
        </div>
      )}
    </Container>
  );
};

const ButtonGroupContainer = styled.div.attrs({
  className: 'flex',
})``;

const MainContainer = styled.div.attrs({
  className: 'flex flex-col space-y-2 desktop:space-y-3',
})``;
const Container = styled.div.attrs({
  className: 'flex flex-col space-y-1.5',
})``;
const HeaderWrapper = styled.div.attrs({
  className:
    'flex flex-col space-y-2 desktop:flex-row desktop:space-y-0 desktop:justify-between',
})``;
const CardsWrapper = styled.div.attrs({
  className: 'grid grid-cols-1 gap-1.5 desktop:grid-cols-2 desktop:gap-3',
})``;
const Title = styled.p.attrs({
  className: 'font-bold ft-text-xl text-ui-800',
})``;
