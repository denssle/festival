import { DataTypes, Model, ModelStatic } from 'sequelize';
import { GuestInformationAttributes } from '$lib/db/attributes/guestInformation.attributes';

import { sequelize } from '$lib/db/sequelize';

export const GuestInformation: ModelStatic<Model<GuestInformationAttributes, any>> = sequelize.define(
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
		coming: { type: DataTypes.BOOLEAN },
		comment: { type: DataTypes.STRING },
	},
	{
		timestamps: true,
		createdAt: true,
		updatedAt: true
	}
);
