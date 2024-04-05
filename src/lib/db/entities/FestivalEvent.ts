import { DataTypes, Model, ModelStatic } from 'sequelize';
import { sequelize } from '$lib/db/db';
import { GuestInformation } from '$lib/db/entities/GuestInformation';

type FestivalEventAttributes = {
	id: string;
	name: string;
	description: string;
	bringYourOwnBottle: boolean;
	bringYourOwnFood: boolean;
	location: string;
	createdBy: string;
	createdAt: Date;
	updatedBy: string;
	updatedAt: Date;
	startDate: Date;
}
export const FestivalEvent: ModelStatic<Model<FestivalEventAttributes, any>> = sequelize.define('FestivalEvent', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		description: {
			type: DataTypes.STRING
		},
		location: {
			type: DataTypes.STRING
		},
		bringYourOwnBottle: {
			type: DataTypes.BOOLEAN
		},
		bringYourOwnFood: {
			type: DataTypes.BOOLEAN
		},
		createdBy: {
			type: DataTypes.STRING
		},
		createdAt: {
			type: DataTypes.DATE
		},
		updatedBy: {
			type: DataTypes.STRING
		},
		updatedAt: {
			type: DataTypes.DATE
		},
		startDate: {
			type: DataTypes.DATE
		}
	});

FestivalEvent.hasOne(GuestInformation, {
	foreignKey: 'festivalEventId'
});
GuestInformation.belongsTo(FestivalEvent);