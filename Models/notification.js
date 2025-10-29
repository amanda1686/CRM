import { DataTypes } from "sequelize";
import db from "../database/db.js";

const NOTIFICATION_KINDS = Object.freeze([
  "info",
  "success",
  "warning",
  "error",
  "announcement",
]);

const sequelize = db.sequelize;

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_num_api: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(180),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    kind: {
      type: DataTypes.ENUM(...NOTIFICATION_KINDS),
      allowNull: false,
      defaultValue: "info",
    },
    link: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "notifications",
    timestamps: false,
  }
);

const originalFindByPk = Notification.findByPk.bind(Notification);

Notification.findByPk = (id, options) => {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) {
    return Promise.resolve(null);
  }
  return originalFindByPk(numericId, options);
};

Notification.prototype.toJSON = function toJSON() {
  return { ...this.get({ plain: true }) };
};

export { Notification, NOTIFICATION_KINDS };
