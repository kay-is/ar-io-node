/**
 * AR.IO Gateway
 * Copyright (C) 2022-2023 Permanent Data Solutions, Inc. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

interface DetailedErrorOptions {
  stack?: string;
  [key: string]: any; // Allow any other properties with any value type
}

export class DetailedError extends Error {
  constructor(message: string, options?: DetailedErrorOptions) {
    super(message);
    this.name = this.constructor.name;
    Object.assign(this, options);
    this.stack = options?.stack ?? new Error().stack;
  }

  toJSON() {
    const { name, message, ...rest } = this;
    return {
      message: this.message,
      stack: this.stack,
      ...rest,
    };
  }

  static fromJSON(json: any): DetailedError {
    const { message, ...options } = json;

    return new DetailedError(message, options);
  }
}
