import fs from "fs";

import csvParse from "csv-parse";
import AppError from '../errors/AppError';

import TransactionsRepository from "../repositories/TransactionsRepository";

import Category from "../models/Category";
import Transaction from "../models/Transaction";

import { getCustomRepository, getRepository, In, TransactionRepository } from "typeorm";


interface CSVTransacton{
  title: string,
  value: number,
  type: "income" | "outcome",
  titleCategory: string,
}



class ImportTransactionsService {
  async execute(path: string): Promise<Transaction[]> {

    const transactionsReadStream = fs.createReadStream(path);

    const parses = csvParse({ from_line: 2 })

    const parsesCSV = transactionsReadStream.pipe(parses);

    const transactions : CSVTransacton[] = [];
    const categories: string[] = [];

    parsesCSV.on('data', async line => {

      const [ title, type, value, titleCategory ] = line.map( ( cell: string ) => cell.trim() );

      if ( !title ||  !type || !value ) return

      categories.push(titleCategory);

      transactions.push({ title, type, value, titleCategory});

    });

    await new Promise( resolve => parsesCSV.on('end', resolve ) );


    const categoresRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);


    const existentCategories = await categoresRepository.find({
      where: { title : In(categories) }
    })

    const existentCategoriesTitles = existentCategories.map( category => category.title );

    const addCategoryTitles = categories
      .filter( category => !existentCategoriesTitles.includes(category) )
      .filter( (value, index, self) => self.indexOf(value) === index );


    let newCategories : Category[] = [];

    if( addCategoryTitles.length !== 0 ) {

      newCategories = categoresRepository
        .create( addCategoryTitles.map( title => ({ title }) ) );

      await categoresRepository.save(newCategories);
    }


    const allCategory = [ ...existentCategories, ...newCategories ]

    const newTransactions = transactionsRepository.create(
      transactions.map( transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category : allCategory.find(
          category => category.title === transaction.titleCategory
        ),
      }))
    );

      await transactionsRepository.save(newTransactions);

      await fs.promises.unlink(path);

    return newTransactions
  }
}

export default ImportTransactionsService;
