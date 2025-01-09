import React, {useCallback, useState} from 'react';
import styled from 'styled-components';

import {useDropzone} from 'react-dropzone';
import {IconAdd, IconClose} from '@aragon/ui-components';
import {Spinner} from '@aragon/ui-components';
import {ButtonIcon} from '@aragon/ui-components';

export type InputPdfSingleProps = {
  /**
   * onChange Event will fires after uploading a valid PDF
   */
  onChange: (file: File | null) => void;
  /**
   * All error messages will pass as onError function inputs
   */
  onError: (error: {code: string; message: string}) => void;
  /**
   * limit maximum file size of the PDF (in bytes)
   */
  maxFileSize?: number;
  /**
   * Passing file name for preview
   */
  preview?: string;
};

export const InputPdfSingle: React.FC<InputPdfSingleProps> = ({
  onChange,
  maxFileSize,
  preview: previewName = '',
  onError,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string>(previewName);

  const onDrop = useCallback(
    (acceptedFiles: Array<File>, onDropRejected) => {
      if (onDropRejected.length !== 0) {
        onError(onDropRejected[0].errors[0]);
      } else {
        setLoading(true);
        // PDF 파일 기본 검증
        const file = acceptedFiles[0];
        if (file.type !== 'application/pdf') {
          onError({
            code: 'wrong-file-type',
            message: 'Please provide a PDF file',
          });
          setLoading(false);
          return;
        }

        onChange(file);
        setPreview(file.name);
        setLoading(false);
      }
    },
    [onChange, onError]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive: isdragactive,
  } = useDropzone({
    onDrop,
    ...(maxFileSize && {maxSize: maxFileSize}),
    accept: 'application/pdf',
  });

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner size="small" />
      </LoadingContainer>
    );
  }

  return preview !== '' ? (
    <PreviewContainer>
      <PreviewText>{preview}</PreviewText>
      <StyledButton
        icon={<IconClose />}
        size="small"
        mode="secondary"
        onClick={() => {
          setPreview('');
          onChange(null);
        }}
      />
    </PreviewContainer>
  ) : (
    <DefaultContainer
      {...{isdragactive}}
      data-testid="input-pdf"
      {...getRootProps()}
    >
      <StyledIconAdd {...{isdragactive}} />
      <input {...getInputProps()} />
    </DefaultContainer>
  );
};

type DefaultContainerProps = {
  isdragactive: boolean;
};

const DefaultContainer = styled.div.attrs(
  ({isdragactive}: DefaultContainerProps) => ({
    className: `flex items-center justify-center bg-ui-0
    h-8 w-8 border-dashed ${
      isdragactive ? 'border-primary-500' : 'border-ui-100'
    } border-2 rounded-xl cursor-pointer`,
  })
)<DefaultContainerProps>``;

const LoadingContainer = styled.div.attrs({
  className: `flex items-center justify-center bg-ui-0 
    h-8 w-8 border-dashed border-primary-500 border-2 rounded-xl`,
})``;

const ImageContainer = styled.div.attrs({
  className: 'relative h-8 w-8',
})``;

const Preview = styled.img.attrs({
  className: 'rounded-xl bg-ui-0 h-8 w-8',
})``;

const StyledButton = styled(ButtonIcon).attrs({
  className: 'absolute -top-2 -right-1.75',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const StyledIconAdd = styled(IconAdd).attrs(
  ({isdragactive}: DefaultContainerProps) => ({
    className: `${isdragactive ? 'text-primary-500' : 'text-ui-600'}`,
  })
)<DefaultContainerProps>``;

const PreviewContainer = styled.div.attrs({
  className: 'relative flex items-center bg-ui-0 h-8 px-2 rounded-xl',
})`
  min-width: 120px;
`;

const PreviewText = styled.span.attrs({
  className: 'text-ui-600 text-sm truncate mr-6',
})``;
