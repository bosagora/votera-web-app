import {
  AlertCard,
  AlertInline,
  ButtonText,
  IconAdd,
  IconLinkExternal,
  Label,
} from '@aragon/ui-components';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {StateEmpty} from 'components/stateEmpty';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';
import {Action, ProposalPhase} from 'utils/types';
import IncreaseAmount from 'components/increaseAmount';
import AssessmentResult from 'components/assessmentResult';
import {ProposalPhaseExtended} from 'pages/proposal';
import {Client} from 'votera-sdk-client';
import {useClient2} from 'hooks/useClient2';
import {BigNumber} from 'ethers';

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

type AssessmentProps = {
  txhash?: string;
  phase?: ProposalPhase;
  onExecuteClicked?: () => void;
  canAssess?: boolean;
  exPhase?: ProposalPhaseExtended;
  exPhaseMessage?: string;
  proposalId: BigNumber;
};

interface Assessment {
  completeness: number;
  possibility: number;
  profitability: number;
  attractiveness: number;
  scalability: number;
}

export const FundAssessmentWidget: React.FC<AssessmentProps> = ({
  phase,
  txhash,
  onExecuteClicked,
  canAssess,
  exPhase,
  exPhaseMessage,
  proposalId,
}) => {
  const {t} = useTranslation();
  const [value, setValue] = useState(10);
  const maxValue = 10;
  const [assessment, setAssessment] = useState<Assessment>({
    completeness: 5,
    possibility: 5,
    profitability: 5,
    attractiveness: 5,
    scalability: 5,
  });

  const [assessmentSummary, setAssessmentSummary] = useState<Assessment>({
    completeness: 0,
    possibility: 0,
    profitability: 0,
    attractiveness: 0,
    scalability: 0,
  });

  const [assessmentLength, setAssessmentLength] = useState(0);

  const {client} = useClient2();

  useEffect(() => {
    console.log('exPhase', exPhase);
    console.log('exPhaseMessage', exPhaseMessage);

    const getAssessmentList = async () => {
      const assessments = await client?.methods.getAssessmentSummary(
        proposalId.toString()
      );
      if (assessments) {
        setAssessmentSummary({
          completeness: assessments[0],
          possibility: assessments[1],
          profitability: assessments[2],
          attractiveness: assessments[3],
          scalability: assessments[4],
        });
        console.log('assessments', assessments);
      }
      const assessmentLength = await client?.methods.getScoreLength(
        proposalId.toString()
      );
      console.log('assessmentLength', assessmentLength);
      if (assessmentLength) {
        setAssessmentLength(assessmentLength);
      }
    };
    getAssessmentList();
  }, [proposalId]);

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

  const handleCompletenessChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAssessment(prev => ({
      ...prev,
      completeness: Number(event.target.value),
    }));
  };

  const handlePossibilityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAssessment(prev => ({
      ...prev,
      possibility: Number(event.target.value),
    }));
  };

  const handleProfitabilityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAssessment(prev => ({
      ...prev,
      profitability: Number(event.target.value),
    }));
  };

  const handleAttractivenessChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAssessment(prev => ({
      ...prev,
      attractiveness: Number(event.target.value),
    }));
  };

  const handleScalabilityChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAssessment(prev => ({
      ...prev,
      scalability: Number(event.target.value),
    }));
  };

  // 전체 평가 점수 계산 (필요한 경우)
  const calculateTotalScore = (): number => {
    const {
      completeness,
      possibility,
      profitability,
      attractiveness,
      scalability,
    } = assessment;
    return (
      (completeness +
        possibility +
        profitability +
        attractiveness +
        scalability) /
      5
    );
  };

  return (
    <Card>
      {/* <Header>
        <Title>{t('governance.executionCard.title')}</Title>
        <Description>{t('governance.executionCard.description')}</Description>
      </Header> */}
      {exPhase === ProposalPhaseExtended.OPENED_ASSESSMENT ? (
        <Content>
          <div className="p-4 border rounded-lg bg-white">
            <div className="space-y-1">
              <IncreaseAmount
                max={10}
                min={1}
                label={'완성도'}
                value={assessment.completeness.toString()}
                mode="default"
                placeholder="1-10 사이 값을 입력하세요"
                onChange={handleCompletenessChange}
              />
              <IncreaseAmount
                max={10}
                min={1}
                label={'실현가능성'}
                value={assessment.possibility.toString()}
                mode="default"
                placeholder="1-10 사이 값을 입력하세요"
                onChange={handlePossibilityChange}
              />
              <IncreaseAmount
                max={10}
                min={1}
                label={'수익성'}
                value={assessment.profitability.toString()}
                mode="default"
                placeholder="1-10 사이 값을 입력하세요"
                onChange={handleProfitabilityChange}
              />
              <IncreaseAmount
                max={10}
                min={1}
                label={'매력도'}
                value={assessment.attractiveness.toString()}
                mode="default"
                placeholder="1-10 사이 값을 입력하세요"
                onChange={handleAttractivenessChange}
              />
              <IncreaseAmount
                max={10}
                min={1}
                label={'확장성'}
                value={assessment.scalability.toString()}
                mode="default"
                placeholder="1-10 사이 값을 입력하세요"
                onChange={handleScalabilityChange}
              />
            </div>
            <WidgetFooter
              phase={phase}
              txhash={txhash}
              onExecuteClicked={onExecuteClicked}
            />
          </div>
        </Content>
      ) : (
        <Content>
          <div className="flex justify-center gap-8 my-6">
            <div className="text-xl font-bold text-blue-500">
              {exPhaseMessage}
            </div>
            {/* <div className="text-3xl font-bold text-red-500">제안 탈락</div> */}
          </div>
          <AssessmentResult
            values={[assessmentSummary]}
            assessmentLength={assessmentLength}
          />
        </Content>
      )}
    </Card>
  );
};

type FooterProps = Pick<
  AssessmentProps,
  'phase' | 'txhash' | 'onExecuteClicked' | 'canAssess'
>;

const WidgetFooter: React.FC<FooterProps> = ({
  phase = 'default',
  onExecuteClicked,
  txhash,
  canAssess,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const handleTxViewButtonClick = () => {
    window.open(CHAIN_METADATA[network].explorer + 'tx/' + txhash, '_blank');
  };

  switch (phase) {
    case ProposalPhase.ASSESSMENT:
      return (
        <Footer>
          <StyledButtonText
            css={{}}
            label={t('governance.proposals.buttons.execute')}
            size="large"
            onClick={onExecuteClicked}
            disabled={!canAssess}
          />
          <AlertInline label={t('governance.executionCard.status.succeeded')} />
        </Footer>
      );
    case ProposalPhase.VOTE:
      return (
        <Footer>
          <StyledButtonText
            css={{}}
            label={t('governance.proposals.buttons.execute')}
            size="large"
            onClick={onExecuteClicked}
            disabled={!canAssess}
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
    case ProposalPhase.EXECUTION:
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
