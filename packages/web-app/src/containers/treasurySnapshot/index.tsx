import {
  ButtonText,
  IconChevronRight,
  IconFinance,
  IconStorage,
  ListItemHeader,
  TransferListItem,
} from '@aragon/ui-components';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {StateEmpty} from 'components/stateEmpty';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useTransactionDetailContext} from 'context/transactionDetail';
import {AllTransfers} from 'utils/paths';
import {abbreviateTokenAmount} from 'utils/tokens';
import {TokenWithMetadata, Transfer} from 'utils/types';
import {htmlIn} from 'utils/htmlIn';
import {useDaoBalances} from '../../hooks/useDaoBalances';
import {useTokenMetadata} from '../../hooks/useTokenMetadata';
import TokenBox from '../tokenMenu/tokenBox';
import {formatUnits} from '../../utils/library';
import {constants} from 'ethers';

type Props = {
  multiSignatureWalletAddress: string;
  transfers: Transfer[];
  totalAssetValue: number;
};

const TreasurySnapshot: React.FC<Props> = ({
  multiSignatureWalletAddress,
  transfers,
  totalAssetValue,
}) => {
  const isWallet = true;
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {handleTransferClicked} = useTransactionDetailContext();
  const {data: tokensB} = useDaoBalances(multiSignatureWalletAddress || '');
  const {data: tokens} = useTokenMetadata(tokensB || []);
  const [searchValue, setSearchValue] = useState('');

  const filterValidator = useCallback(
    (token: TokenWithMetadata) => {
      if (searchValue !== '') {
        const re = new RegExp(searchValue, 'i');
        return (
          token?.metadata.name?.match(re) || token?.metadata.symbol?.match(re)
        );
      }
      return true;
    },
    [searchValue]
  );

  const sortTokens = (a: TokenWithMetadata, b: TokenWithMetadata) => {
    if (
      a.metadata.id === constants.AddressZero ||
      b.metadata.id === constants.AddressZero
    ) {
      return 1;
    } else {
      const aName = (a.metadata.name || '').toLowerCase();
      const bName = (b.metadata.name || '').toLowerCase();
      return aName.localeCompare(bName);
    }
  };
  const RenderTokens = () => {
    const tokenList = tokens.filter(filterValidator).sort(sortTokens);

    if (tokenList.length === 0 && searchValue === '') {
      return (
        <>
          <NoTokenContainer>
            <IconWrapper>
              <IconStorage height={24} width={24} />
            </IconWrapper>
            <TokenTitle>{t('TokenModal.tokenNotAvailable')}</TokenTitle>
            <TokenDescription>
              {isWallet
                ? t('TokenModal.tokenNotAvailableSubtitle')
                : t('TokenModal.tokenNotAvailableSubtitleDao')}
            </TokenDescription>
          </NoTokenContainer>
        </>
      );
    } else if (tokenList.length === 0) {
      return (
        <>
          <NoTokenWrapper>
            <TokenTitle>{t('TokenModal.tokenNotFoundTitle')}</TokenTitle>
            <TokenSubtitle>
              {isWallet
                ? t('TokenModal.tokenNotFoundSubtitle')
                : t('TokenModal.tokenNotFoundSubtitleDao')}
            </TokenSubtitle>
          </NoTokenWrapper>
        </>
      );
    } else {
      return (
        <>
          {tokenList.map(token => (
            <div
              key={token.metadata.id}
              // onClick={() => handleTokenClick(token)}
            >
              <TokenBox
                tokenName={token.metadata.name}
                tokenLogo={token.metadata.imgUrl}
                tokenSymbol={token.metadata.symbol}
                tokenBalance={abbreviateTokenAmount(
                  formatUnits(token.balance, token.metadata.decimals)
                )}
              />
            </div>
          ))}
        </>
      );
    }
  };

  if (transfers.length === 10) {
    return (
      <StateEmpty
        type="both"
        mode="card"
        body={'chart'}
        expression={'excited'}
        hair={'bun'}
        object={'wallet'}
        title={t('finance.emptyState.title')}
        description={htmlIn(t)('finance.emptyState.description')}
        secondaryButton={{
          label: t('finance.emptyState.buttonLabel'),
          onClick: () => open('deposit'),
        }}
        renderHtml
      />
    );
  }

  return (
    <Container>
      <ListItemHeader
        icon={<IconFinance />}
        // value={new Intl.NumberFormat('en-US', {
        //   style: 'currency',
        //   currency: 'USD',
        // }).format(totalAssetValue)}
        value={t('labels.treasuryValue') + 's'}
        label=""
        // label={t('labels.treasuryValue')}
        buttonText={t('modal.deposit.headerTitle')}
        orientation="vertical"
        onClick={() => open('deposit')}
      />
      {transfers.slice(0, 3).map(({tokenAmount, ...rest}) => (
        <TransferListItem
          key={rest.id}
          tokenAmount={abbreviateTokenAmount(tokenAmount)}
          {...rest}
          onClick={() => handleTransferClicked({tokenAmount, ...rest})}
        />
      ))}
      {/*<ButtonText*/}
      {/*  css={{}}*/}
      {/*  mode="secondary"*/}
      {/*  size="large"*/}
      {/*  iconRight={<IconChevronRight />}*/}
      {/*  label={t('labels.seeAll')}*/}
      {/*  onClick={() =>*/}
      {/*    navigate(*/}
      {/*      generatePath(AllTransfers, {*/}
      {/*        network,*/}
      {/*        dao: multiSignatureWalletAddress,*/}
      {/*      })*/}
      {/*    )*/}
      {/*  }*/}
      {/*/>*/}
      <TokensWrapper>
        <RenderTokens />
      </TokensWrapper>
    </Container>
  );
};

export default TreasurySnapshot;
const Container = styled.div.attrs({
  className: 'space-y-1.5 desktop:space-y-2',
})``;

const TokensWrapper = styled.div.attrs({
  className: 'space-y-1 mt-1',
})``;

const TokenTitle = styled.h2.attrs({
  className: 'text-base font-bold',
})``;

const TokenSubtitle = styled.h2.attrs({
  className: 'text-sm text-ui-600',
})``;

const TokenDescription = styled.h2.attrs({
  className: 'text-sm text-center text-ui-600',
})``;

const WideButton = styled(ButtonText).attrs({
  className: 'w-full justify-center',
})``;

const NoTokenWrapper = styled.div.attrs({
  className: 'space-y-0.5 mb-3',
})``;

const NoTokenContainer = styled.div.attrs({
  className: `flex flex-col items-center mb-3
    justify-center bg-ui-100 py-3 px-2 rounded-xl`,
})``;

const IconWrapper = styled.div.attrs({
  className: 'mb-1.5',
})``;
