/**
 * @license
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Audit a page to see if it is using passive event listeners on
 * document-level event listeners (e.g. on window, document, document.body).
 */

'use strict';

const url = require('url');
const Audit = require('../audit');
const Formatter = require('../../formatters/formatter');

const SCROLL_BLOCKING_EVENTS = [
  'wheel', 'mousewheel', 'touchstart', 'touchmove'
];

class PassiveEventsAudit extends Audit {

  /**
   * @return {!AuditMeta}
   */
  static get meta() {
    return {
      category: 'JavaScript',
      name: 'uses-passive-event-listeners',
      description: 'Site uses passive event listeners to improve scrolling performance',
      helpText: `<a href="https://www.chromestatus.com/features/5745543795965952" target="_blank">Passive event listeners</a> enable better scrolling performance. If you don't call <code>preventDefault()</code> in your <code>${SCROLL_BLOCKING_EVENTS.toString()}</code> event listeners, make them passive: <code>addEventListener('touchstart', ..., {passive: true})</code>.`,
      requiredArtifacts: ['URL', 'PageLevelEventListeners']
    };
  }

  /**
   * @param {!Artifacts} artifacts
   * @return {!AuditResult}
   */
  static audit(artifacts) {
    if (typeof artifacts.PageLevelEventListeners === 'undefined' ||
        artifacts.PageLevelEventListeners === -1) {
      return PassiveEventsAudit.generateAuditResult({
        rawValue: -1,
        debugString: 'PageLevelEventListeners gatherer did not run'
      });
    } else if (artifacts.PageLevelEventListeners.rawValue === -1) {
      return PassiveEventsAudit.generateAuditResult(artifacts.PageLevelEventListeners);
    }

    const listeners = artifacts.PageLevelEventListeners;
    const pageHost = url.parse(artifacts.URL.finalUrl).host;

    // Filter out non-passive window/document/document.body listeners that do
    // not call preventDefault() are scroll blocking events.
    const results = listeners.filter(loc => {
      const isScrollBlocking = SCROLL_BLOCKING_EVENTS.indexOf(loc.type) !== -1;
      const callsPreventDefault = loc.handler.description.match(
            /\.preventDefault\(\s*\)/g);
      const sameHost = url.parse(loc.url).host === pageHost;
      return sameHost && isScrollBlocking && !loc.passive &&
             !callsPreventDefault;
    }).map(loc => {
      return Object.assign({
        label: `line: ${loc.line}, col: ${loc.col}`,
        code: `${loc.objectId}.addEventListener('${loc.type}', ${loc.handler.description})`
      }, loc);
    });

    return PassiveEventsAudit.generateAuditResult({
      rawValue: results.length === 0,
      extendedInfo: {
        formatter: Formatter.SUPPORTED_FORMATS.URLLIST,
        value: results
      }
    });
  }
}

module.exports = PassiveEventsAudit;
