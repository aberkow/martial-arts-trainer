import { v4 as uuidv4 } from 'uuid'
import slugify from '@sindresorhus/slugify'

import connectToUser from '../../lib/connectToUser'
import { Context } from '../../pages/api/graphql'

export const sequenceMutations = {
  createSequence: async (_, { sequenceData }, ctx: Context) => {

  },
  updateSequence: async (_, { sequenceData }, ctx: Context) => {

  },
  deleteSequence: async (_, { sequenceData }, ctx: Context) => {

  },
}