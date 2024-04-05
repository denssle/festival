import { sequelize } from '$lib/db/db';
import { DataTypes, Model, ModelStatic } from 'sequelize';

type GuestInformationAttributes = {
	id: string;
	festivalEventId: string;
	food: string;
	drink: string;
	numberOfOtherGuests: number;
	coming: boolean;
	comment: string;
}

export const GuestInformation: ModelStatic<Model<GuestInformationAttributes, any>> = sequelize.define('GuestInformation', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		festivalEventId: {
			type: DataTypes.STRING,
			allowNull: false
		},
		food: { type: DataTypes.STRING },
		drink: { type: DataTypes.STRING },
		numberOfOtherGuests: { type: DataTypes.INTEGER },
		coming: { type: DataTypes.BOOLEAN },
		comment: { type: DataTypes.STRING }
	}
);