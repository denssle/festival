import { DataTypes, Model, ModelStatic } from 'sequelize';
import {
	GuestInformationAttributes,
	GuestInformationCreationAttributes
} from '$lib/db/attributes/guestInformation.attributes';

import { sequelize } from '$lib/db/sequelize';
import { ANSWERS } from '$lib/models/Answer';

export const GuestInformation: ModelStatic<Model<GuestInformationAttributes, GuestInformationCreationAttributes>> =
	sequelize.define(
		'guestInformation',
		{
			id: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false
			},
			food: { type: DataTypes.STRING },
			drink: { type: DataTypes.STRING },
			numberOfOtherGuests: { type: DataTypes.INTEGER },
			// Dabei / vielleicht / nicht dabei (seit Migration 0004, vorher BOOLEAN `coming`).
			// In MariaDB zusätzlich per CHECK auf die drei Werte beschränkt.
			answer: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'no',
				validate: { isIn: [[...ANSWERS]] }
			},
			comment: { type: DataTypes.TEXT },
			FestivalEventId: { type: DataTypes.STRING, allowNull: false },
			UserId: { type: DataTypes.STRING, allowNull: false }
		},
		{
			timestamps: true,
			createdAt: true,
			updatedAt: true,
			indexes: [
				{
					unique: true,
					fields: ['FestivalEventId', 'UserId']
				}
			]
		}
	);
