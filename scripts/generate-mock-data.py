# Regenerates the mock JSON in src/data.  Usage: python3 scripts/generate-mock-data.py src/data
import json, random, os, sys
from datetime import date, timedelta

random.seed(42)
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
TODAY = date(2026, 10, 6)

def d(x): return x.isoformat()

# ---------------- Products ----------------
# name, category, cost, price, unit
P = [
  ("Paracetamol 500mg Tablet (Box of 100)", "OTC Medicines", 85, 150),
  ("Ibuprofen 400mg Tablet (Box of 100)", "OTC Medicines", 160, 265),
  ("Cetirizine 10mg Tablet (Box of 100)", "OTC Medicines", 120, 220),
  ("Loperamide 2mg Capsule (Box of 100)", "OTC Medicines", 140, 245),
  ("Phenylephrine + Paracetamol Cold Tablet (Box of 100)", "OTC Medicines", 390, 560),
  ("Dextromethorphan Cough Syrup 60ml", "OTC Medicines", 68, 115),
  ("Antacid Chewable Tablet (Box of 50)", "OTC Medicines", 175, 290),
  ("Amoxicillin 500mg Capsule (Box of 100)", "Prescription Medicines", 320, 520),
  ("Losartan 50mg Tablet (Box of 100)", "Prescription Medicines", 280, 480),
  ("Amlodipine 5mg Tablet (Box of 100)", "Prescription Medicines", 210, 380),
  ("Metformin 500mg Tablet (Box of 100)", "Prescription Medicines", 190, 330),
  ("Atorvastatin 20mg Tablet (Box of 30)", "Prescription Medicines", 260, 420),
  ("Omeprazole 20mg Capsule (Box of 30)", "Prescription Medicines", 150, 270),
  ("Salbutamol Inhaler 100mcg", "Prescription Medicines", 230, 365),
  ("Cefalexin 500mg Capsule (Box of 100)", "Prescription Medicines", 420, 690),
  ("Vitamin C 500mg Tablet (Bottle of 100)", "Vitamins & Supplements", 210, 360),
  ("Vitamin B-Complex Tablet (Bottle of 100)", "Vitamins & Supplements", 330, 540),
  ("Multivitamins + Iron Capsule (Bottle of 60)", "Vitamins & Supplements", 380, 620),
  ("Vitamin D3 1000IU Softgel (Bottle of 60)", "Vitamins & Supplements", 290, 495),
  ("Omega-3 Fish Oil 1000mg Softgel (Bottle of 100)", "Vitamins & Supplements", 520, 850),
  ("Calcium + Vitamin D Tablet (Bottle of 60)", "Vitamins & Supplements", 260, 430),
  ("Zinc Gluconate 20mg Tablet (Bottle of 100)", "Vitamins & Supplements", 180, 310),
  ("Vitamin E 400IU Softgel (Bottle of 30)", "Vitamins & Supplements", 240, 395),
  ("Children's Multivitamin Syrup 120ml", "Vitamins & Supplements", 135, 225),
  ("Whey Protein Isolate 2lb", "Vitamins & Supplements", 1650, 2490),
  ("Glutathione 500mg Capsule (Bottle of 60)", "Vitamins & Supplements", 780, 1290),
  ("Malunggay (Moringa) Capsule (Bottle of 100)", "Herbal & Natural", 150, 265),
  ("Lagundi Leaf 600mg Tablet (Box of 100)", "Herbal & Natural", 260, 430),
  ("Sambong 500mg Tablet (Box of 100)", "Herbal & Natural", 240, 400),
  ("Turmeric Curcumin Capsule (Bottle of 60)", "Herbal & Natural", 310, 520),
  ("Virgin Coconut Oil Softgel (Bottle of 100)", "Herbal & Natural", 190, 320),
  ("Digital Blood Pressure Monitor", "Medical Devices", 1450, 2350),
  ("Glucometer Test Strips (Box of 50)", "Medical Devices", 620, 980),
  ("Digital Thermometer", "Medical Devices", 95, 180),
  ("Pulse Oximeter", "Medical Devices", 520, 890),
  ("Nebulizer Machine", "Medical Devices", 1350, 2190),
  ("Surgical Face Mask (Box of 50)", "Personal Care", 65, 120),
  ("Isopropyl Alcohol 70% 500ml", "Personal Care", 58, 95),
  ("Hand Sanitizer Gel 250ml", "Personal Care", 62, 110),
  ("Adult Diapers Medium (Pack of 10)", "Personal Care", 290, 455),
  ("Sterile Gauze Pads 4x4 (Pack of 100)", "First Aid", 210, 340),
  ("Adhesive Bandages Assorted (Box of 100)", "First Aid", 95, 165),
  ("Povidone-Iodine Solution 120ml", "First Aid", 88, 150),
  ("Elastic Bandage 4in", "First Aid", 45, 85),
  ("Oral Rehydration Salts (Box of 25)", "First Aid", 145, 245),
  ("Infant Formula Stage 1 900g", "Mother & Baby", 760, 1095),
  ("Prenatal Vitamins + Folic Acid (Bottle of 30)", "Mother & Baby", 340, 560),
  ("Baby Diaper Rash Cream 50g", "Mother & Baby", 120, 210),
]
prefix = {"OTC Medicines":"OTC","Prescription Medicines":"RX","Vitamins & Supplements":"VIT","Herbal & Natural":"HRB","Medical Devices":"DEV","Personal Care":"PCR","First Aid":"FAD","Mother & Baby":"MBB"}
counters = {}
products = []
for i,(name,cat,cost,price) in enumerate(P):
    counters[cat] = counters.get(cat,0)+1
    sku = f"{prefix[cat]}-{1000+counters[cat]*7+i:04d}"
    reorder = random.choice([10,15,20,25,30,40,50])
    r = random.random()
    if r < 0.09: stock = 0
    elif r < 0.25: stock = random.randint(1, reorder)
    else: stock = random.randint(reorder+5, reorder*6)
    if cat == "Medical Devices":
        exp = None
    else:
        exp = d(TODAY + timedelta(days=random.choice([random.randint(40,120), random.randint(180,900), random.randint(300,1000)])))
    products.append({"id": f"prd_{i+1:03d}","name":name,"sku":sku,"category":cat,"costPrice":cost,"sellingPrice":price,
        "stock":stock,"reorderLevel":reorder,"expiryDate":exp,"supplier":random.choice(["Zuellig Pharma","Metro Drug Inc.","United Laboratories","Pharmawealth","DKSH Philippines","Mercury Supply Co."])})

# ---------------- Customers ----------------
C = [
 ("St. Luke's Community Clinic","clinic","0917 845 2210","Cebu City"),
 ("Mabolo Family Health Center","clinic","0922 371 5584","Cebu City"),
 ("Lapu-Lapu Wellness Clinic","clinic","0918 220 6731","Lapu-Lapu City"),
 ("Mandaue Doctors Diagnostic","clinic","0927 553 1098","Mandaue City"),
 ("Talisay Medical Arts","clinic","0915 663 4420","Talisay City"),
 ("Botica de Banilad","pharmacy","0932 117 8845","Cebu City"),
 ("Farmacia Consolacion","pharmacy","0917 902 3316","Consolacion"),
 ("Minglanilla Drugstore","pharmacy","0919 448 2271","Minglanilla"),
 ("Liloan Health Mart","pharmacy","0926 334 7719","Liloan"),
 ("Cordova Botika ng Bayan","pharmacy","0908 551 2093","Cordova"),
 ("FitLife Gym & Nutrition","business","0917 776 4512","Cebu City"),
 ("Golden Years Home Care","business","0928 640 1187","Mandaue City"),
 ("Sunrise Elderly Care Facility","business","0939 225 8804","Talisay City"),
 ("Maria Santos","individual","0916 552 3390","Cebu City"),
 ("Jose Reyes","individual","0945 118 7263","Mandaue City"),
 ("Ana Villanueva","individual","0917 334 9081","Cebu City"),
 ("Ramon Dela Cruz","individual","0921 870 4456","Lapu-Lapu City"),
 ("Cristina Bautista","individual","0998 663 2215","Cebu City"),
 ("Eduardo Lim","individual","0917 220 1334","Talisay City"),
 ("Grace Tan","individual","0915 908 6627","Cebu City"),
 ("Walk-in Customer","walkin","—","—"),
]
customers = []
for i,(n,t,ph,city) in enumerate(C):
    customers.append({"id":f"cus_{i+1:03d}","name":n,"type":t,"phone":ph,"email": None if t in ("walkin",) else n.lower().replace(" ","").replace("'","").replace("&","and").replace(".","").replace(",","")[:18]+"@example.ph","city":city,
        "creditTerms": 30 if t in ("clinic","pharmacy","business") else 0})

weights = []
for c in customers:
    weights.append({"clinic":6,"pharmacy":7,"business":4,"individual":2,"walkin":14}[c["type"]])

# ---------------- Orders ----------------
start = TODAY - timedelta(days=365)
orders = []
n = 0
day = start
# seasonal multiplier: rainy season (Jun-Oct) higher
season = {1:0.95,2:0.9,3:0.92,4:0.97,5:1.0,6:1.1,7:1.2,8:1.22,9:1.18,10:1.15,11:1.0,12:1.08}
growth_base = 0.75
while day <= TODAY:
    progress = (day - start).days / 365
    lam = (1.0 + 1.2*progress) * season[day.month] * (0.6 if day.weekday()==6 else 1.0)
    k = max(0, int(round(random.gauss(lam, 0.7))))
    if day == TODAY: k = max(k, 6)
    for _ in range(k):
        n += 1
        cust = random.choices(customers, weights=weights)[0]
        b2b = cust["type"] in ("clinic","pharmacy","business")
        nitems = random.randint(2,5) if b2b else random.randint(1,3)
        prods = random.sample(products, nitems)
        items = []
        for p in prods:
            # popularity bias
            q = random.randint(4,30) if b2b else random.randint(1,4)
            if p["category"] in ("OTC Medicines","Vitamins & Supplements"): q = int(q*1.4)+1
            items.append({"productId":p["id"],"name":p["name"],"sku":p["sku"],"category":p["category"],"quantity":q,"unitPrice":p["sellingPrice"],"total":q*p["sellingPrice"]})
        sub = sum(i["total"] for i in items)
        disc = round(sub*0.05) if b2b and sub > 15000 else 0
        total = sub - disc
        age = (TODAY - day).days
        if random.random() < 0.035: status = "Cancelled"
        elif not b2b: status = "Paid"
        else:
            r = random.random()
            if age > 75: status = "Paid" if r < 0.9 else ("Partial" if r < 0.96 else "Unpaid")
            elif age > 30: status = "Paid" if r < 0.6 else ("Partial" if r < 0.8 else "Unpaid")
            else: status = "Paid" if r < 0.35 else ("Partial" if r < 0.6 else "Unpaid")
        if status == "Paid": paid = total
        elif status == "Partial": paid = int(round(total*random.uniform(0.25,0.7)/10)*10)
        else: paid = 0
        h = random.randint(8,20); m = random.randint(0,59)
        orders.append({"id":f"ord_{n:05d}","orderNumber":f"SO-{day.year}-{n:05d}","customerId":cust["id"],"customerName":cust["name"],
            "date":d(day),"time":f"{h:02d}:{m:02d}","items":items,"subtotal":sub,"discount":disc,"total":total,"amountPaid":paid,"status":status,
            "paymentMethod": None if status in ("Unpaid","Cancelled") and paid==0 else random.choice(["Cash","GCash","Bank Transfer","Credit Card"] if not b2b else ["Bank Transfer","Check","GCash","Cash"]),
            "createdBy":random.choice(["Andrea Cruz","Mark Villareal","Joy Fernandez"])})
    day += timedelta(days=1)

# ---------------- Invoices & payments ----------------
invoices = []
payments = []
pn = 0
for o in orders:
    if o["status"] == "Cancelled": continue
    cust = next(c for c in customers if c["id"]==o["customerId"])
    od = date.fromisoformat(o["date"])
    due = od + timedelta(days=cust["creditTerms"])
    remaining = o["total"] - o["amountPaid"]
    if remaining == 0: st = "Paid"
    elif due < TODAY: st = "Overdue"
    elif o["amountPaid"] > 0: st = "Partial"
    else: st = "Unpaid"
    inv = {"id":"inv_"+o["id"][4:],"invoiceNumber":"INV-"+o["orderNumber"][3:],"orderNumber":o["orderNumber"],"customerId":cust["id"],"customerName":cust["name"],
           "issueDate":o["date"],"dueDate":d(due),"amountDue":o["total"],"amountPaid":o["amountPaid"],"balance":remaining,"status":st}
    invoices.append(inv)
    # payment transactions
    if o["amountPaid"] > 0:
        chunks = [o["amountPaid"]]
        if o["amountPaid"] == o["total"] and cust["creditTerms"] and random.random()<0.35 and o["total"]>4000:
            a = int(round(o["total"]*random.uniform(0.3,0.6)/10)*10); chunks=[a,o["total"]-a]
        pd = od if cust["creditTerms"]==0 else od + timedelta(days=random.randint(0, min(40,(TODAY-od).days)))
        for ci,amt in enumerate(chunks):
            pdate = pd if ci==0 else min(TODAY, pd + timedelta(days=random.randint(5,25)))
            pn += 1
            payments.append({"id":f"pay_{pn:05d}","receiptNumber":f"OR-{pdate.year}-{pn:05d}","invoiceNumber":inv["invoiceNumber"],"customerId":cust["id"],"customerName":cust["name"],
                "date":d(pdate),"amount":amt,"method":o["paymentMethod"] or "Cash","receivedBy":random.choice(["Andrea Cruz","Mark Villareal","Joy Fernandez"])})
# ensure some collections today on B2B
for inv in [i for i in invoices if i["status"] in ("Partial","Unpaid","Overdue") and i["balance"]>2000][:3]:
    amt = int(round(inv["balance"]*0.5/10)*10)
    inv["amountPaid"] += amt; inv["balance"] -= amt
    if inv["status"]=="Unpaid": inv["status"]="Partial"
    o = next(x for x in orders if x["orderNumber"]==inv["orderNumber"])
    o["amountPaid"] += amt
    if o["status"]=="Unpaid": o["status"]="Partial"
    pn += 1
    payments.append({"id":f"pay_{pn:05d}","receiptNumber":f"OR-2026-{pn:05d}","invoiceNumber":inv["invoiceNumber"],"customerId":inv["customerId"],"customerName":inv["customerName"],
        "date":d(TODAY),"amount":amt,"method":"Bank Transfer","receivedBy":"Andrea Cruz"})
payments.sort(key=lambda p:(p["date"],p["id"]))

# customer aggregates
for c in customers:
    co = [o for o in orders if o["customerId"]==c["id"] and o["status"]!="Cancelled"]
    c["totalOrders"] = len(co)
    c["totalPurchases"] = sum(o["total"] for o in co)
    c["outstandingBalance"] = sum(i["balance"] for i in invoices if i["customerId"]==c["id"])
    c["lastPurchaseDate"] = max((o["date"] for o in co), default=None)

# ---------------- Inventory movements ----------------
users = ["Andrea Cruz","Mark Villareal","Joy Fernandez","Paolo Garcia"]
moves = []
mn = 0
recent = [o for o in orders if (TODAY - date.fromisoformat(o["date"])).days <= 45 and o["status"]!="Cancelled"]
for o in recent:
    for it in o["items"]:
        mn += 1
        moves.append({"id":f"mov_{mn:05d}","date":o["date"],"time":o["time"],"productId":it["productId"],"productName":it["name"],"sku":it["sku"],
            "type":"Stock Out","quantity":it["quantity"],"reference":o["orderNumber"],"reason":"Sale","user":o["createdBy"]})
for i in range(70):
    p = random.choice(products)
    dd = TODAY - timedelta(days=random.randint(0,45))
    mn += 1
    q = random.choice([24,36,48,50,60,100,120,200])
    moves.append({"id":f"mov_{mn:05d}","date":d(dd),"time":f"{random.randint(8,17):02d}:{random.randint(0,59):02d}","productId":p["id"],"productName":p["name"],"sku":p["sku"],
        "type":"Stock In","quantity":q,"reference":f"PO-2026-{random.randint(300,999)}","reason":f"Delivery from {p['supplier']}","user":random.choice(["Paolo Garcia","Mark Villareal"])})
for i in range(8):
    p = random.choice(products)
    dd = TODAY - timedelta(days=random.randint(0,45)); mn += 1
    moves.append({"id":f"mov_{mn:05d}","date":d(dd),"time":f"{random.randint(8,17):02d}:{random.randint(0,59):02d}","productId":p["id"],"productName":p["name"],"sku":p["sku"],
        "type":"Stock Out","quantity":random.randint(1,6),"reference":f"ADJ-2026-{random.randint(100,199)}","reason":random.choice(["Expired — disposed","Damaged in storage","Cycle count adjustment"]),"user":"Paolo Garcia"})
moves.sort(key=lambda m:(m["date"],m["time"]), reverse=True)

notifications = [
 {"id":"n1","title":"Low stock alert","message":f"{sum(1 for p in products if 0<p['stock']<=p['reorderLevel'])} products are at or below reorder level.","time":"2026-10-06T08:05:00","type":"warning","read":False},
 {"id":"n2","title":"Payment received","message":f"{payments[-1]['customerName']} paid ₱{payments[-1]['amount']:,}.","time":"2026-10-06T10:42:00","type":"success","read":False},
 {"id":"n3","title":"Invoices overdue","message":f"{sum(1 for i in invoices if i['status']=='Overdue')} invoices are past their due date.","time":"2026-10-06T07:30:00","type":"danger","read":False},
 {"id":"n4","title":"Products nearing expiry","message":f"{sum(1 for p in products if p['expiryDate'] and (date.fromisoformat(p['expiryDate'])-TODAY).days<=90)} products expire within 90 days.","time":"2026-10-05T16:10:00","type":"warning","read":True},
 {"id":"n5","title":"Delivery received","message":"Purchase order from Zuellig Pharma was received and stocked.","time":"2026-10-05T11:20:00","type":"info","read":True},
]

meta = {"businessName":"PharmaCare Drugstore & Wellness","branch":"Cebu Main Branch","currency":"PHP","asOfDate":d(TODAY),
        "user":{"name":"Andrea Cruz","email":"admin@pharmacare.ph","role":"Store Administrator"}}

def dump(name,obj):
    with open(os.path.join(OUT,name),"w") as f: json.dump(obj,f,indent=2,ensure_ascii=False)
dump("products.json",products); dump("customers.json",customers); dump("orders.json",orders)
dump("invoices.json",invoices); dump("payments.json",payments); dump("inventory-movements.json",moves)
dump("notifications.json",notifications); dump("meta.json",meta)
print(len(products),len(customers),len(orders),len(invoices),len(payments),len(moves))
print("today orders", sum(1 for o in orders if o["date"]==d(TODAY)))
print("receivables", sum(i["balance"] for i in invoices), {s:sum(1 for i in invoices if i["status"]==s) for s in ["Paid","Partial","Unpaid","Overdue"]})
