import {MigrationInterface, QueryRunner, Table, TableForeignKey, ColumnOptions } from "typeorm";
import { TableColumnOptions } from "typeorm/schema-builder/options/TableColumnOptions";



// COLUMNS

const create_at_column :TableColumnOptions = {
  name: "created_at",
  type: "timestamp",
  default: "now()",
}

const update_at_column :TableColumnOptions = {
  name: "updated_at",
  type: "timestamp",
  default: "now()",
}

const id_column : TableColumnOptions = {
  name: "id",
  type: "uuid",
  isPrimary: true,
  generationStrategy: 'uuid',
  default: 'uuid_generate_v4()',
}

const title_column : TableColumnOptions = {
  name: "title",
  type: "varchar",
}



//  TABLES ****


const categories = new Table({
  name: "categories",

  columns: [
    id_column,
    create_at_column,
    update_at_column,
    title_column
  ]
});


const transactionsTable = new Table({
  name: "transactions",

  columns: [
    id_column,
    create_at_column,
    update_at_column,
    title_column,
    {
      name: "category_id",
      type: "uuid",
      isNullable: true,
    },
    {
      name: "value",
      type: "decimal",
      precision: 10,
      scale: 2,
    },
    {
      name: "type",
      type: "varchar",
    }
  ],

})


const transactionsCategoriesForeignKey = new TableForeignKey({
  name: "transactionsCategories",
  columnNames: ['category_id'],
  referencedColumnNames: ['id'],
  referencedTableName: 'categories',
  onDelete: "SET NULL",
  onUpdate: "CASCADE"
});


export default class CreateTransactionTable1594471924680 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(transactionsTable);
      await queryRunner.createTable(categories);
      await queryRunner.createForeignKey(transactionsTable.name,transactionsCategoriesForeignKey);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable('transactions');
      await queryRunner.dropTable('categories');

    }

}
