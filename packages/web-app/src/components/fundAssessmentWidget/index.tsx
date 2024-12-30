import {
  AlertCard,
  AlertInline,
  ButtonText,
  IconAdd,
  IconLinkExternal,
  Label,
} from '@aragon/ui-components';
import React, { useState } from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {StateEmpty} from 'components/stateEmpty';
import {useNetwork} from 'context/network';
// import {PluginTypes} from 'hooks/usePluginClient';
import {CHAIN_METADATA} from 'utils/constants';
import {Action} from 'utils/types';

import {PluginTypes} from '../../utils/aragon/types';
import IncreaseAmount from 'components/increaseAmount';

export type ExecutionStatus =
  | 'defeated'
  | 'executed'
  | 'executable'
  | 'executable-failed'
  | 'default';

type ExecutionWidgetProps = {
  pluginType?: PluginTypes;
  txhash?: string;
  actions?: Array<Action | undefined>;
  status?: ExecutionStatus;
  onAddAction?: () => void;
  onExecuteClicked?: () => void;
};

interface Assessment {
  completeness: number;
  possibility: number;
  profitability: number;
  attractiveness: number;
  scalability: number;
}

export const FundAssessmentWidget: React.FC<ExecutionWidgetProps> = ({
  actions = [],
  status,
  txhash,
  onAddAction,
  onExecuteClicked,
  pluginType,
}) => {
  const {t} = useTranslation();
  const [value, setValue] = useState(10);
  const maxValue = 10;
  const [assessment, setAssessment] = useState<Assessment>({
    completeness: 5,
    possibility: 5,
    profitability: 5,
    attractiveness: 5,
    scalability: 5
  });

  const handleValueChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetValue = Number(event.target.value);
    console.log('value', targetValue);
    const CORRECTION_DELAY = 1000;

    if (targetValue > maxValue) {
      setTimeout(() => {
        console.log('maxValue', maxValue);
      }, CORRECTION_DELAY);
    } else if (targetValue <= 0) {
      setTimeout(() => {
        console.log('minValue', targetValue);
      }, CORRECTION_DELAY);
    } else {
      event.target.value = targetValue.toString();
    }

    setValue(targetValue);
  };

  const handleCompletenessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAssessment(prev => ({
      ...prev,
      completeness: Number(event.target.value)
    }));
  };

  const handlePossibilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAssessment(prev => ({
      ...prev,
      possibility: Number(event.target.value)
    }));
  };

  const handleProfitabilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAssessment(prev => ({
      ...prev,
      profitability: Number(event.target.value)
    }));
  };

  const handleAttractivenessChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAssessment(prev => ({
      ...prev,
      attractiveness: Number(event.target.value)
    }));
  };

  const handleScalabilityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAssessment(prev => ({
      ...prev,
      scalability: Number(event.target.value)
    }));
  };

  // 전체 평가 점수 계산 (필요한 경우)
  const calculateTotalScore = (): number => {
    const { completeness, possibility, profitability, attractiveness, scalability } = assessment;
    return (completeness + possibility + profitability + attractiveness + scalability) / 5;
  };

  return (
    <Card>
      <Header>
        <Title>{t('governance.executionCard.title')}</Title>
        <Description>{t('governance.executionCard.description')}</Description>
      </Header>
      {actions.length === 0 ? (
        <StateEmpty
          mode="inline"
          type="Object"
          object="smart_contract"
          title="No actions were added"
          secondaryButton={
            onAddAction && {
              label: t('governance.executionCard.addAction'),
              onClick: onAddAction,
              iconLeft: <IconAdd />,
            }
          }
        />
      ) : (
        <>
          <Content>
          <div className="space-y-4">
            <div>
              <Label label={'완성도 (Completeness)'} />
              <IncreaseAmount 
                max={10}
                min={1} 
                value={assessment.completeness}
                mode="default"
                placeholder="1-10 사이 값을 입력하세요"
                onChange={handleCompletenessChange}
              />
            </div>

            <div>
              <Label label={'실현 가능성 (Possibility)'} />
              <IncreaseAmount 
                max={10}
                min={1} 
                value={assessment.possibility}
                mode="default"
                placeholder="1-10 사이 값을 입력하세요"
                onChange={handlePossibilityChange}
              />
            </div>

            <div>
              <Label label={'수익성 (Profitability)'} />
              <IncreaseAmount 
                max={10}
                min={1} 
                value={assessment.profitability}
                mode="default"
                placeholder="1-10 사이 값을 입력하세요"
                onChange={handleProfitabilityChange}
              />
            </div>

            <div>
              <Label label={'매력도 (Attractiveness)'} />
              <IncreaseAmount 
                max={10}
                min={1} 
                value={assessment.attractiveness}
                mode="default"
                placeholder="1-10 사이 값을 입력하세요"
                onChange={handleAttractivenessChange}
              />
            </div>

            <div>
              <Label label={'확장성 (Scalability)'} />
              <IncreaseAmount 
                max={10}
                min={1} 
                value={assessment.scalability}
                mode="default"
                placeholder="1-10 사이 값을 입력하세요"
                onChange={handleScalabilityChange}
              />
            </div>
          </div>
          </Content>
          <WidgetFooter
            pluginType={pluginType}
            status={status}
            txhash={txhash}
            onExecuteClicked={onExecuteClicked}
          />
        </>
      )}
    </Card>
  );
};

type FooterProps = Pick<
  ExecutionWidgetProps,
  'status' | 'txhash' | 'onExecuteClicked' | 'pluginType'
>;

const WidgetFooter: React.FC<FooterProps> = ({
  status = 'default',
  onExecuteClicked,
  txhash,
  pluginType,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const handleTxViewButtonClick = () => {
    window.open(CHAIN_METADATA[network].explorer + 'tx/' + txhash, '_blank');
  };

  switch (status) {
    case 'defeated': {
      return pluginType === 'multisig.plugin.dao.eth' ? (
        <AlertCard
          mode="info"
          title={t('governance.executionCard.statusMultisig.expiredTitle')}
          helpText={t('governance.executionCard.statusMultisig.expiredDesc')}
        />
      ) : (
        <AlertInline
          label={t('governance.executionCard.status.defeated')}
          mode={'warning'}
        />
      );
    }

    case 'executable':
      return (
        <Footer>
          <StyledButtonText
            css={{}}
            label={t('governance.proposals.buttons.execute')}
            size="large"
            onClick={onExecuteClicked}
          />
          <AlertInline label={t('governance.executionCard.status.succeeded')} />
        </Footer>
      );
    case 'executable-failed':
      return (
        <Footer>
          <StyledButtonText
            css={{}}
            label={t('governance.proposals.buttons.execute')}
            size="large"
            onClick={onExecuteClicked}
          />
          {txhash && (
            <StyledButtonText
              css={{}}
              label={t('governance.executionCard.seeTransaction')}
              mode="secondary"
              iconRight={<IconLinkExternal />}
              size="large"
              bgWhite
              onClick={handleTxViewButtonClick}
            />
          )}
          <AlertInline
            label={t('governance.executionCard.status.failed')}
            mode="warning"
          />
        </Footer>
      );
    case 'executed':
      return (
        <Footer>
          {txhash && (
            <StyledButtonText
              css={{}}
              label={t('governance.executionCard.seeTransaction')}
              mode="secondary"
              iconRight={<IconLinkExternal />}
              size="large"
              bgWhite
              onClick={handleTxViewButtonClick}
            />
          )}

          <AlertInline
            label={t('governance.executionCard.status.executed')}
            mode="success"
          />
        </Footer>
      );
    default:
      return null;
  }
};

const Card = styled.div.attrs({
  className:
    'w-84 flex-col bg-white rounded-xl py-3 px-2 desktop:p-3 space-y-3',
})``;

const Header = styled.div.attrs({
  className: 'flex flex-col space-y-1',
})``;

const Title = styled.h2.attrs({
  className: 'text-ui-800 font-bold ft-text-xl',
})``;

const Description = styled.p.attrs({
  className: 'text-ui-600 font-normal ft-text-sm',
})``;

const Content = styled.div.attrs({
  className: 'flex flex-col space-y-3',
})``;

const Footer = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row items-center gap-y-2 tablet:gap-y-0 tablet:gap-x-3',
})``;

const StyledButtonText = styled(ButtonText).attrs({
  className: 'w-full tablet:w-max',
})``;
