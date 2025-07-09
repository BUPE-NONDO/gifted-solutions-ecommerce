from pay import PayClass

# Fixed syntax errors: added quotes around string values
callPay = PayClass.momopay(50, "EUR", "1234test99", "2600961288156", "donate for vwit")
if callPay["response"] == 200 or callPay["response"] == 202:
    print("Transaction successful")
else:
    print("Transaction failed")

#Verify the transaction
verify = PayClass.verifymomo(callPay["ref"])

# Check if the transaction status is successful
if verify.get("status") == "SUCCESSFUL":
    print("Thank you for buying this product!")
else:
    print("Sorry, your purchase was not successful. Please try again or check your balance.")
