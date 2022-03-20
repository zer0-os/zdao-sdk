import messages from '../config/constants/messages.json';

export const t = (key: string): string => {
  if (Object.keys(messages).includes(key)) {
    return (messages as any)[key];
  }
  return '--';
};
