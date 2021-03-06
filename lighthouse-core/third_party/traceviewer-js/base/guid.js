"use strict";
/**
Copyright (c) 2014 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("./base.js");

'use strict';

global.tr.exportTo('tr.b', function () {
  var nextGUID = 1;

  var UUID4_PATTERN = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

  var GUID = {
    /* Allocate an integer GUID.
     *
     * These GUIDs are not unique between loads, but are fast to generate, and
     * consume very little memory.
     *
     * @return {number} globally unique id.
     */
    allocateSimple: function () {
      return nextGUID++;
    },

    /* Return the last GUID allocated without allocating a new one.
     *
     * @return {number} last guid.
     */
    getLastSimpleGuid: function () {
      return nextGUID - 1;
    },

    /* Generate a random string UUID.
     *
     * Version 4 random UUIDs are practically guaranteed to be unique between
     * loads, so they can be serialized and compared with results from other
     * loads. These are slower to generate and consume more memory than simple
     * GUIDs.
     *
     * @return {string} universally unique id.
     */
    allocateUUID4: function () {
      return UUID4_PATTERN.replace(/[xy]/g, function (c) {
        var r = parseInt(Math.random() * 16);
        if (c === 'y') r = (r & 3) + 8;
        return r.toString(16);
      });
    }
  };

  return {
    GUID: GUID
  };
});