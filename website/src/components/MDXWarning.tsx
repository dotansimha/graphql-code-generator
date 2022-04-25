import React from 'react';
import type { FC } from 'react';
import { Flex, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';

export const MDXWarning: FC<{
  title: string;
}> = props => {
  return (
    <Alert status="warning" variant="subtle" flexDirection="column" alignItems="start" mb={3} mt={3}>
      <Flex flexDirection="row">
        <AlertIcon />
        <AlertTitle fontSize="md">{props.title}</AlertTitle>
      </Flex>
      <AlertDescription>{props.children}</AlertDescription>
    </Alert>
  );
};
