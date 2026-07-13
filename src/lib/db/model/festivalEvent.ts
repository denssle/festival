import { DataTypes, Model, ModelStatic } from 'sequelize';
import { FestivalEventAttributes, FestivalEventCreationAttributes } from '$lib/db/attributes/festivalEvent.attributes';

import { sequelize } from '$lib/db/sequelize';

export const FestivalEvent: ModelStatic<Model<FestivalEventAttributes, FestivalEventCreationAttributes>> =
	sequelize.define(
		'festivalEvent',
		{
			id: {
				type: DataTypes.STRING,
				primaryKey: true,
				allowNull: false
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false
			},
			description: { type: DataTypes.STRING },
			location: { type: DataTypes.STRING },
			bringYourOwnBottle: { type: DataTypes.BOOLEAN },
			bringYourOwnFood: { type: DataTypes.BOOLEAN },
			startDate: { type: DataTypes.DATE },
			UserId: { type: DataTypes.STRING, allowNull: false }
		},
		{
			timestamps: true,
			createdAt: true,
			updatedAt: true
		}
	);
