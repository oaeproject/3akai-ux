module("Sorting");

test("Natural sorting: Strings", function(){
    var arrayTest = ["z10.doc", "z2.doc", "z17.doc", "z23.doc", "z3.doc", "z1.doc"];
    var arrayNatural = ["z1.doc", "z2.doc", "z3.doc", "z10.doc", "z17.doc", "z23.doc"];

    same(arrayTest.sort(sakai.api.Util.Sorting.naturalSort), arrayNatural);
});

test("Natural sorting: Integers", function(){
    var arrayTest = [10,1,900,1000,3,4];
    var arrayNatural = [1,3,4,10,900,1000];

    same(arrayTest.sort(sakai.api.Util.Sorting.naturalSort), arrayNatural);
});

test("Natural sorting: Dates", function(){
    var dateTest1 = new Date(8000);
    var dateTest2 = new Date(98777);
    var dateTest3 = new Date(100000);
    var dateTest4 = new Date(150087);
    var dateTest5 = new Date(9878742);

    var arrayTest = [dateTest4,dateTest2,dateTest1,dateTest3,dateTest5];
    var arrayNatural = [dateTest1,dateTest2,dateTest3,dateTest4,dateTest5];

    same(arrayTest.sort(sakai.api.Util.Sorting.naturalSort), arrayNatural);
});