import { DataTypes } from "sequelize";
import { connectDB, getConnection } from "./db.js";

let CounterModel;

function ensureCounterModel() {
  const sequelize = getConnection();
  if (CounterModel) {
    return CounterModel;
  }

  const existing = sequelize.models.Counter;
  if (existing) {
    CounterModel = existing;
    return CounterModel;
  }

  CounterModel = sequelize.define(
    "Counter",
    {
      name: {
        type: DataTypes.STRING(191),
        primaryKey: true,
      },
      seq: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "counters",
      timestamps: false,
    }
  );

  return CounterModel;
}

export async function getNextSequenceValue(sequenceName) {
  if (!sequenceName) {
    throw new Error("sequenceName es requerido");
  }

  await connectDB();
  const sequelize = getConnection();
  const Counter = ensureCounterModel();

  const nextValue = await sequelize.transaction(async (transaction) => {
    const existing = await Counter.findOne({
      where: { name: sequenceName },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!existing) {
      const fresh = await Counter.create(
        { name: sequenceName, seq: 1 },
        { transaction, hooks: false }
      );
      return fresh.seq;
    }

    existing.seq += 1;
    await existing.save({ transaction, hooks: false });
    return existing.seq;
  });

  if (typeof nextValue !== "number") {
    throw new Error(`No se pudo generar la secuencia para ${sequenceName}`);
  }

  return nextValue;
}
