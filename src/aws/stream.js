// @flow
import type { Context, Callback } from 'flow-aws-lambda'
import type { TransferDataType } from './transfer.flow'
import Config from './config.js'

var AWS = require('aws-sdk')
var sqs = new AWS.SQS({ region: 'us-east-1' })
var utils = require('./utils.js')

if (!process.env.SQS_NAME) throw new Error('SQS_NAME missing')
const sqsName = process.env.SQS_NAME

type RecordType = {
  eventName: string,
  dynamodb: {
    // eslint-disable-next-line flowtype/no-weak-types
    NewImage: Object
  }
}

exports.handler = function (
  event: { Records: Array<RecordType> },
  context: Context,
  callback: Callback
) {
  try {
    for (let record: RecordType of event.Records) {
      try {

        // skip REMOVE events
        // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_streams_Record.html
        if (record.eventName !== 'INSERT' && record.eventName !== 'MODIFY') continue

        const newImage = record.dynamodb.NewImage
        const transferData: TransferDataType = AWS.DynamoDB.Converter.unmarshall(newImage)
        if (transferData.mock) continue
        const transferStage = transferData.transferStage
        const txState = transferData[utils.lowerCaseFirstLetter(transferStage)].txState
        if (txState === 'Pending') {
          console.log(
            'eventName: %s, transferId: %s, transferStage: %s',
            record.eventName,
            newImage.transferId.S,
            transferStage
          )
          const params = {
            MessageBody: JSON.stringify(transferData),
            QueueUrl: Config.QueueURLPrefix + sqsName,
            MessageAttributes: {
              RetryCount: {
                DataType: 'Number',
                StringValue: '0'
              },
              TxHashConfirmed: {
                DataType: 'Number',
                StringValue: '0' // O means False, 1 means true
              },
              GasTxHashConfirmed: {
                DataType: 'Number',
                StringValue: '0' // O means False, 1 means true
              }
            }
          }
          sqs.sendMessage(params, function (err: string, data: { MessageId: string }) {
            if (err) {
              console.error('Fail to send message: ', err)
            } else {
              console.log('MessageId:', data.MessageId)
            }
          })
        }
      } catch (err) {
        // produce a warning and drop the event
        console.error(`Unable to process record: ${JSON.stringify(record)}`)
      }
    }
    callback(null, 'message')
  } catch (err) {
    callback(err)
  }
}
