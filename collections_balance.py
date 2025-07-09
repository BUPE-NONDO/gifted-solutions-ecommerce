from pay import PayClass

#Checking the disbursment balance
disbursementBalanceCheck = PayClass.momobalancedisbursement()
print(disbursementBalanceCheck)

#Checking the collections balance
collectionsBalanceCheck = PayClass.momobalance()
print(collectionsBalanceCheck)
