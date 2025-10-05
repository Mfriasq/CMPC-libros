import React from 'react';
import { Box, Typography } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

interface PasswordValidationHelpProps {
  password: string;
  showAll?: boolean;
}

export const PasswordValidationHelp: React.FC<PasswordValidationHelpProps> = ({ 
  password = '', 
  showAll = true 
}) => {
  const validations = [
    {
      id: 'length',
      label: '8-128 caracteres',
      test: () => password.length >= 8 && password.length <= 128,
    },
    {
      id: 'uppercase',
      label: 'Al menos una mayúscula (A-Z)',
      test: () => /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'Al menos una minúscula (a-z)',
      test: () => /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'Al menos un número (0-9)',
      test: () => /\d/.test(password),
    },
    {
      id: 'special',
      label: 'Al menos un símbolo (!@#$%^&*)',
      test: () => /[!@#$%^&*()_+=[\]{};':"\\|,.<>/?]/.test(password),
    },
    {
      id: 'noSpaces',
      label: 'Sin espacios',
      test: () => !password || !/\s/.test(password),
    },
    {
      id: 'noCommon',
      label: 'Sin secuencias comunes (123456, qwerty, etc.)',
      test: () => {
        const commonSequences = ['123456', 'abcdef', 'qwerty', 'password', 'admin', 'user', '111111', '000000', 'abc123', '123abc'];
        return !password || !commonSequences.some(seq => password.toLowerCase().includes(seq));
      },
    },
  ];

  const getValidationIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
    ) : (
      <Cancel sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
    );
  };

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        La contraseña debe contener:
      </Typography>
      <Box>
        {validations.map((validation) => {
          const isValid = validation.test();
          return (
            <Box
              key={validation.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.75rem',
                color: isValid ? 'success.main' : 'text.secondary',
                mb: 0.25,
              }}
            >
              {getValidationIcon(isValid)}
              {validation.label}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default PasswordValidationHelp;