import { DataTypes } from "sequelize";
import db from "../database/db.js";

const sequelize = db.sequelize;

const Communication = sequelize.define(
  "Communication",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    sender_num_api: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "communications",
    timestamps: false,
  }
);

const CommunicationRecipient = sequelize.define(
  "CommunicationRecipient",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    communication_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: Communication,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    recipient_num_api: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    archived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "communication_recipients",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Communication.hasMany(CommunicationRecipient, {
  as: "recipients",
  foreignKey: "communication_id",
});
CommunicationRecipient.belongsTo(Communication, {
  as: "communication",
  foreignKey: "communication_id",
});

Communication.prototype.toJSON = function toJSON() {
  return { ...this.get({ plain: true }) };
};

CommunicationRecipient.prototype.toJSON = function toJSON() {
  return { ...this.get({ plain: true }) };
};

CommunicationRecipient.findByCommunication = function findByCommunication(communicationId) {
  const numericId = Number(communicationId);
  if (!Number.isInteger(numericId)) {
    return Promise.resolve([]);
  }
  return CommunicationRecipient.findAll({
    where: { communication_id: numericId },
    order: [["id", "ASC"]],
  });
};

export { Communication, CommunicationRecipient };
