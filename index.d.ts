export type UserT = {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
};

export type TransactionT = {
  amount: number;
  timestamp: string;
  type: string;
  category: string;
  user: string;
};

export type EntityT = {
  offset: number;
  length: number;
  type: string;
};

export type MessageT = {
  message_id: number;
  from: UserT;
  chat: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    type: string;
  };
  date: number;
  text: string;
  entities: EntityT[];
};

export type CallbackQueryT = {
  id: string;
  from: UserT;
  message?: MessageT;
  data?: string;
};

export type UpdateT = {
  update_id: number;
  message?: MessageT;
  callback_query?: CallbackQueryT;
};

export type CategoryT = {
  name: string;
  slug: string;
  emoji: string;
};

type SendMessageFuncT = (
  chat_id: number | string,
  text: string,
  parse_mode?: string
) => void;

type SendMessageKeyboardFuncT = (
  chat_id: number | string,
  text: string,
  reply_markup: object
) => void;

type UpdateMessageKeyboardFuncT = (
  chat_id: number | string,
  reply_markup: object
) => Promise<void>;

type SendPollFuncT = (
  chat_id: number | string,
  question: string,
  options: string[]
) => void;

type AnswerQueryFuncT = (
  callback_query_id: string,
  text?: string,
  show_alert?: boolean
) => void;
