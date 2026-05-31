/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

/**
 * List.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     List:
 *       type: object
 *       required:
 *         - id
 *         - boardId
 *         - type
 *         - position
 *         - name
 *         - color
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the list
 *           example: "1357158568008091264"
 *         boardId:
 *           type: string
 *           description: ID of the board the list belongs to
 *           example: "1357158568008091265"
 *         type:
 *           type: string
 *           enum: [active, closed, archive, trash]
 *           description: Type/status of the list
 *           example: active
 *         position:
 *           type: number
 *           nullable: true
 *           description: Position of the list within the board
 *           example: 65536
 *         name:
 *           type: string
 *           nullable: true
 *           description: Name/title of the list
 *           example: To Do
 *         color:
 *           type: string
 *           enum: [muddy-grey, autumn-leafs, morning-sky, antique-blue, egg-yellow, desert-sand, dark-granite, fresh-salad, lagoon-blue, midnight-blue, light-orange, pumpkin-orange, light-concrete, sunny-grass, navy-blue, lilac-eyes, apricot-red, orange-peel, bright-moss, deep-ocean, summer-sky, berry-red, light-cocoa, grey-stone, tank-green, coral-green, sugar-plum, pink-tulip, shady-rust, wet-rock, wet-moss, turquoise-sea, lavender-fields, piggy-red, light-mud, gun-metal, modern-green, french-coast, sweet-lilac, red-burgundy]
 *           nullable: true
 *           description: Color for the list
 *           example: lagoon-blue
 *         createdAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the list was created
 *           example: 2024-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the list was last updated
 *           example: 2024-01-01T00:00:00.000Z
 */

const Types = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  ARCHIVE: 'archive',
  TRASH: 'trash',
};

const TypeStates = {
  OPENED: 'opened',
  CLOSED: 'closed',
};

const SortFieldNames = {
  NAME: 'name',
  DUE_DATE: 'dueDate',
  CREATED_AT: 'createdAt',
};

// TODO: should not be here
const SortOrders = {
  ASC: 'asc',
  DESC: 'desc',
};

const FINITE_TYPES = [Types.ACTIVE, Types.CLOSED];

const KANBAN_TYPES = [Types.ACTIVE, Types.CLOSED];

const TYPE_STATE_BY_TYPE = {
  [Types.ACTIVE]: TypeStates.OPENED,
  [Types.CLOSED]: Types.CLOSED,
};

// Same palette as labels (see Label.js COLORS) for the full set of shades.
const COLORS = [
  'muddy-grey',
  'autumn-leafs',
  'morning-sky',
  'antique-blue',
  'egg-yellow',
  'desert-sand',
  'dark-granite',
  'fresh-salad',
  'lagoon-blue',
  'midnight-blue',
  'light-orange',
  'pumpkin-orange',
  'light-concrete',
  'sunny-grass',
  'navy-blue',
  'lilac-eyes',
  'apricot-red',
  'orange-peel',
  'bright-moss',
  'deep-ocean',
  'summer-sky',
  'berry-red',
  'light-cocoa',
  'grey-stone',
  'tank-green',
  'coral-green',
  'sugar-plum',
  'pink-tulip',
  'shady-rust',
  'wet-rock',
  'wet-moss',
  'turquoise-sea',
  'lavender-fields',
  'piggy-red',
  'light-mud',
  'gun-metal',
  'modern-green',
  'french-coast',
  'sweet-lilac',
  'red-burgundy',
];

module.exports = {
  Types,
  TypeStates,
  SortFieldNames,
  SortOrders,
  FINITE_TYPES,
  KANBAN_TYPES,
  TYPE_STATE_BY_TYPE,
  COLORS,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    type: {
      type: 'string',
      isIn: Object.values(Types),
      required: true,
    },
    position: {
      type: 'number',
      allowNull: true,
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      allowNull: true,
    },
    color: {
      type: 'string',
      isIn: COLORS,
      allowNull: true,
    },
    defaultLabelIds: {
      type: 'json',
      defaultsTo: [],
      columnName: 'default_label_ids',
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    boardId: {
      model: 'Board',
      required: true,
      columnName: 'board_id',
    },
    cards: {
      collection: 'Card',
      via: 'listId',
    },
  },
};
