/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 *
 * Fork feature (Jigglyy/planka): per-user board templates. Not present upstream.
 */

/**
 * BoardTemplate.js
 *
 * A reusable, per-user blueprint for a board: its kanban lists
 * (name/type/color), labels (name/color) and a few board settings.
 * Used when creating a board to pre-populate it. Built-in templates
 * are code-defined (see BUILT_IN_TEMPLATES) and ship with the image;
 * user templates are rows owned by the creating user.
 */

const BUILT_IN_ID_PREFIX = 'builtin:';

// Code-defined templates everyone can apply. `id`s are prefixed so they
// never collide with numeric DB ids. `data` mirrors the shape produced
// by board-templates/build-from-board.js (board/lists/labels). Positions
// are NOT stored here; apply-template assigns them by array order.
const BUILT_IN_TEMPLATES = [
  {
    id: `${BUILT_IN_ID_PREFIX}kanban`,
    name: 'Basic Kanban',
    data: {
      board: {},
      labels: [],
      lists: [
        { name: 'To Do', type: 'active', color: 'lagoon-blue' },
        { name: 'In Progress', type: 'active', color: 'egg-yellow' },
        { name: 'Done', type: 'closed', color: 'fresh-salad' },
      ],
    },
  },
  {
    id: `${BUILT_IN_ID_PREFIX}software`,
    name: 'Software Development',
    data: {
      board: {},
      labels: [
        { name: 'Bug', color: 'berry-red' },
        { name: 'Feature', color: 'lagoon-blue' },
        { name: 'Chore', color: 'grey-stone' },
        { name: 'Blocked', color: 'red-burgundy' },
      ],
      lists: [
        { name: 'Backlog', type: 'active', color: 'grey-stone' },
        { name: 'To Do', type: 'active', color: 'lagoon-blue' },
        { name: 'In Progress', type: 'active', color: 'egg-yellow' },
        { name: 'In Review', type: 'active', color: 'pumpkin-orange' },
        { name: 'Done', type: 'closed', color: 'fresh-salad' },
      ],
    },
  },
  {
    id: `${BUILT_IN_ID_PREFIX}dice-incremental`,
    name: 'Dice Incremental',
    data: {
      board: {},
      labels: [],
      lists: [
        { name: 'Technical Reminders', type: 'active', color: 'red-burgundy' },
        { name: 'Ideas & Monetization', type: 'active', color: 'turquoise-sea' },
        { name: 'TODO', type: 'active', color: 'lagoon-blue' },
        { name: 'Issues', type: 'active', color: 'berry-red' },
        { name: 'Done', type: 'active', color: 'fresh-salad' },
        { name: 'Done - Add to Changelog', type: 'active', color: 'bright-moss' },
        { name: 'Done Fully', type: 'closed', color: 'modern-green' },
        { name: 'Not Doing', type: 'closed', color: 'dark-granite' },
      ],
    },
  },
];

const isBuiltInId = (id) => _.isString(id) && id.startsWith(BUILT_IN_ID_PREFIX);

const getBuiltInById = (id) => BUILT_IN_TEMPLATES.find((template) => template.id === id) || null;

const MAX_LISTS = 100;
const MAX_LABELS = 200;
const MAX_NAME_LENGTH = 128;

const BOARD_SETTING_BOOLEAN_KEYS = [
  'limitCardTypesToDefaultOne',
  'alwaysDisplayCardCreator',
  'displayCardAges',
  'expandTaskListsByDefault',
];

const cleanName = (value) => {
  if (!_.isString(value)) {
    return null;
  }

  const trimmed = value.trim().slice(0, MAX_NAME_LENGTH);
  return trimmed.length > 0 ? trimmed : null;
};

// Whitelists every field of a template's `data` against the live model
// constants. Applied both before storing (build-from-board) and before
// use (apply-template) so a tampered/garbage/oversized JSON can never
// reach board creation with an invalid enum/color/type — the same class
// of bug per-list default labels guarded against.
const sanitizeData = (rawData) => {
  const data = _.isPlainObject(rawData) ? rawData : {};

  const rawBoard = _.isPlainObject(data.board) ? data.board : {};
  const board = {};

  if (Object.values(Board.Views).includes(rawBoard.defaultView)) {
    board.defaultView = rawBoard.defaultView;
  }
  if (Object.values(Card.Types).includes(rawBoard.defaultCardType)) {
    board.defaultCardType = rawBoard.defaultCardType;
  }
  BOARD_SETTING_BOOLEAN_KEYS.forEach((key) => {
    if (!_.isUndefined(rawBoard[key])) {
      board[key] = Boolean(rawBoard[key]);
    }
  });

  const lists = (_.isArray(data.lists) ? data.lists : [])
    .slice(0, MAX_LISTS)
    .filter((list) => _.isPlainObject(list))
    .map((list) => ({
      name: cleanName(list.name),
      type: List.KANBAN_TYPES.includes(list.type) ? list.type : List.Types.ACTIVE,
      color: List.COLORS.includes(list.color) ? list.color : null,
    }))
    .filter((list) => list.name !== null);

  const labels = (_.isArray(data.labels) ? data.labels : [])
    .slice(0, MAX_LABELS)
    .filter((label) => _.isPlainObject(label) && Label.COLORS.includes(label.color))
    .map((label) => ({
      name: cleanName(label.name),
      color: label.color,
    }));

  return { board, lists, labels };
};

module.exports = {
  BUILT_IN_ID_PREFIX,
  BUILT_IN_TEMPLATES,
  isBuiltInId,
  getBuiltInById,
  sanitizeData,

  attributes: {
    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝

    name: {
      type: 'string',
      required: true,
    },
    data: {
      type: 'json',
      defaultsTo: {},
    },

    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝

    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    userId: {
      model: 'User',
      required: true,
      columnName: 'user_id',
    },
  },

  tableName: 'board_template',
};
