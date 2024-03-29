// @flow
import type { TransferDataType } from './transfer.flow'
export type TransferDataEmailCompatibleType = {
  ...$Exact<TransferDataType>,
  isDemo?: boolean,
  rootUrl?: string,
  cryptoSymbol?: string,
  // send
  sendTxHash?: string,
  sendTimestampHumanReadable?: string,
  sendTimestampLinkParams?: string,
  // receive
  receiveTxHash?: string,
  receiveTimestampHumanReadable?: string,
  receiveTimestampLinkParams?: string,
  // cancel
  cancelTxHash?: string,
  cancelTimestampHumanReadable?: string,
  cancelTimestampLinkParams?: string,
  // additional data
  expirePeriod?: string,
  remainPeriod?: string
}

export type TemplateType = {
  Source: string,
  ConfigurationSetName: string,
  Destination: {
    ToAddresses: Array<string>
  },
  Template: string,
  TemplateData: string
}

export type SendTemplatedEmailReturnType = {
  MessageId: string
}

export type EmailActionRecordType = {
  messageId: string,
  transferId: string,
  promoteTransfer?: boolean,
  click?: number, // unix timestamp
  open?: number, // unix timestamp
  complaint?: number // unix timestamp
}

export type EmailMessageEventType = 'Click' | 'Open' | 'Complaint' | 'Bounce'
