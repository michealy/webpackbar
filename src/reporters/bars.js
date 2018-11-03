/* eslint-disable no-console */
import Consola from 'consola';
import chalk from 'chalk';
import prettyTime from 'pretty-time';

import { renderBar, colorize, ellipsisLeft } from '../utils/cli';
import { formatRequest } from '../utils/request';
import { BULLET, TICK } from '../utils/consts';
import LogUpdate from '../utils/log-update';

let lastRender = Date.now();

let logUpdate = null;

export default class BarsReporter {
  compiling() {
    logUpdate = logUpdate || new LogUpdate();
    Consola.pause();
  }

  done() {
    lastRender = Date.now();
    logUpdate.done();
    Consola.resume();
  }

  compiled(context) {
    this._render(context);
  }

  update(context) {
    if (Date.now() - lastRender > 200) {
      this._render(context);
    }
  }

  _render(context) {
    lastRender = Date.now();

    const renderedStates = Object.keys(context.states)
      .sort((n1, n2) => n1.localeCompare(n2))
      .map((name) => ({ name, state: context.states[name] }))
      .map((c) => this._renderState(c))
      .join('\n\n');

    logUpdate.render('\n' + renderedStates + '\n');
  }

  _renderState({ name, state }) {
    const color = colorize(state.color);

    if (!state.isRunning) {
      const color2 = state.progress === 100 ? color : chalk.grey;

      const line1 = color2(`${TICK} ${name}`);
      const time = prettyTime(state.elapsed || 0, 2);
      const line2 = chalk.grey(`  Compiled succesfuly in ${time}`);

      return line1 + '\n' + line2;
    }

    const line1 = [
      color(BULLET),
      color(name),
      renderBar(state.progress, state.color),
      state.msg,
      `(${state.progress || 0}%)`,
      chalk.grey((state.details && state.details[0]) || ''),
      chalk.grey((state.details && state.details[1]) || ''),
    ].join(' ');

    const line2 = state.request
      ? '  ' +
        chalk.grey(
          ellipsisLeft(formatRequest(state.request), logUpdate.columns)
        )
      : '';

    return line1 + '\n' + line2;
  }
}