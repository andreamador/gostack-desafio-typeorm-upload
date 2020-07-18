import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category  from '../models/Category';

import { getCustomRepository, getRepository, TransactionRepository } from "typeorm";
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request{
  title: string,
  value: number,
  type: "income" | "outcome",
  titleCategory: string,
}

class CreateTransactionService {
  public async execute({ title, value, type, titleCategory } : Request  ): Promise<Transaction> {



    const typeNotAllowed = !['income','outcome'].includes( type.toLowerCase() )

    if ( typeNotAllowed )
      throw new AppError("Type not Allowed",400);


    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();

    const insufficientFunds = type === "outcome" && total < value

    if (insufficientFunds)
      throw new AppError('Insufficient Funds', 400)


    const categoriesRepository = getRepository(Category);

    let category = await categoriesRepository.findOne({ where: {title: titleCategory }});

    if (!category){
      category = categoriesRepository.create({ title : titleCategory });
      await categoriesRepository.save(category);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category
    })

    await transactionsRepository.save(transaction);

    return transaction
  }
}

export default CreateTransactionService;
