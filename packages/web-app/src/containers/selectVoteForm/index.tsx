import {ButtonText} from '@aragon/ui-components';
import React, {useState} from 'react';
import {Controller, useForm, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import useScreen from 'hooks/useScreen';
import {ListItemVote} from '../../components/listItem/vote';

type VoteType = 'yes' | 'no' | 'abstain';

const SelectVoteForm: React.FC = () => {
  const {t} = useTranslation();
  const {isMobile} = useScreen();

  const [selectedVote, setSelectedVote] = useState<VoteType>();

  const voteOptions = [
    {
      id: 'yes',
      title: '찬성',
      description: '이 제안에 동의합니다',
      icon: '👍',
    },
    {
      id: 'no',
      title: '반대',
      description: '이 제안에 반대합니다',
      icon: '👎',
    },
    {
      id: 'abstain',
      title: '기권',
      description: '투표를 보류합니다',
      icon: '🤔',
    },
  ];

  return (
    <>
      <FormItem>
        {voteOptions.map((option) => (
          <ListItemVote
            key={option.id}
            onClick={() => {
              setSelectedVote(option.id as VoteType);
            }}
            selected={selectedVote === option.id}
            title={option.title}
            description={option.description}
            icon={option.icon}
          />
        ))}
      </FormItem>
    </>
  );
};

export default SelectVoteForm;

const Header = styled.div.attrs({
  className: 'flex justify-between items-center mb-3',
})``;

const FormItem = styled.div.attrs({
  className: 'space-y-2',
})``;
