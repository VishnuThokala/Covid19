var express = require('express');
var app =express();
var ejs =require('ejs')
var request =require('request')
var bodyParser = require('body-parser')
const pdata= require('./pdata.json')
const port =process.env.PORT||4000 ;
app.set("view engine", 'ejs');
const fs = require('fs');

app.use(bodyParser.urlencoded({ extended: true }));





function getYesDate(){
    var today = new Date();
var dd = today.getDate()-1;
var mm = today.getMonth(); 
var yyyy = today.getFullYear();
var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
if(dd<10) 
{
    dd=dd;
} 
today = dd+'-'+month[mm]+'-'+yyyy.toString().substr(-2);;
return today;
}
function getThisMonth(){
  var today = new Date();
  var yyyy = today.getFullYear();

  var mm = today.getMonth(); 
  var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
  
  
  return month[mm]+'-'+yyyy.toString().substr(-2); 
}
function getNextMonth(){
  var today = new Date();
  var yyyy = today.getFullYear();

  var mm = today.getMonth()+1; 
  var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
  return month[mm]+'-'+yyyy.toString().substr(-2); 
}
app.get('/', (req, res) => {
  
	
		// request('https://covid19futurepredictor.herokuapp.com/predictor', { json: true }, (err, result, body) => {
		// 	if (err) {
		// 		return err;
		// 	}
		// 	else {
		// 		let data = JSON.stringify(body['states_daily'], null, 2);

		// 		fs.writeFileSync('./pdata.json',data );

		// 	}
		// }
		// )
	

    request('https://api.covid19india.org/states_daily.json',{json:true},(err,result,body)=>{
        if(err)
        {
			res.send(err);
        }
        else{
            var confrimed=0 ,recovered =0 ,deceased=0 ;
            var predicted=0 ;

            
          data = body['states_daily'];
          // console.log(data[1562])
          
          console.log(data.length)
            for(var i=0;i<data.length;i++ ){
                
               

                if(data[i]['status']=='Confirmed')
                  {
                    confrimed=confrimed+Number(data[i]['tt']);
                  }
                 else if(data[i]['status']=="Recovered")
                  {
                    recovered=recovered+Number(data[i]['tt']);
                  }
                 else if(data[i]['status']=="Deceased")
                  {
                    deceased=deceased+Number(data[i]['tt']);
                  }  
            }
            var c=0;
			      today = getYesDate();
            for(var k=0;k<pdata.length ;k++)
			     {
             if(pdata[k]['Date']==today){
				 
			      predicted = pdata[k]['tt'];
			  
               break;
             }
           }
           
            summary = {
              "total":confrimed,
              "discharged": recovered,
              "deaths": deceased,
              "totalP":predicted,
             
           }
            res.render('covid19',{summary:summary});
        }
    })
    
})

app.get('/stateview/:id',(req,res)=>{
  console.log("len:", pdata.length)
  
today=getYesDate();

    request('https://api.covid19india.org/states_daily.json',{json:true},(err,result,body)=>{
        if(err)
        {
            res.send(err);
        }
        else{
            var stateWiseConfrimed=0 ,stateWiseRecovered =0 ,stateWiseDeceased=0 ;
            var stateWisePredicted =0  ,date;
            data = body['states_daily'];
					var confirmedArray = [];      
             data.forEach(data => {
                if(data['status']=='Confirmed')
				{          
                   stateWiseConfrimed=stateWiseConfrimed+Number(data[req.params.id]);

	
				
                    confirmedArray.push(stateWiseConfrimed);
                   
                  }
                 else if(data['status']=="Recovered")
                  {
                    stateWiseRecovered=stateWiseRecovered+Number(data[req.params.id]);
                  }
                 else if(data['status']=="Deceased")
                  {
                    stateWiseDeceased=stateWiseDeceased+Number(data[req.params.id]);
                  }    
                  
                  

                })
			
                var totalTodayP ,totalToday;
                dateWiseData=[];
          for (var k = 0; k < pdata.length; k++){
            
              var s= pdata[k]['Date'];
              s = s.toString().substr(-6)
             if(getThisMonth()==s ||getNextMonth()==s ){
              if (k <= confirmedArray.length) {
                totalToday = confirmedArray[k-1];
              }
              else{
                totalToday = "---";
              }
              totalTodayP = pdata[k][req.params.id];
              date = pdata[k]['Date']
              summaryToday={
                "date":date,
                "total":totalToday,  
                "totalP":totalTodayP,
             }
             
        
             dateWiseData.push(summaryToday);
                  
             }
              if(pdata[k]['Date']==today){
              stateWisePredicted = Number(pdata[k][req.params.id]);
              }

            }
            summary = {
			        	"total": stateWiseConfrimed,
                "discharged": stateWiseRecovered,
                "deaths": stateWiseDeceased,
                "totalP":stateWisePredicted,
                "plot":plotDict[req.params.id],
                "name":namesDict[req.params.id],
                "img" :stateDict[req.params.id]
             }
             res.render('stateview',{data:{summary:summary,summaryToday:dateWiseData }})
        }
    })
    
})



app.listen(port,(err)=>{
    if(err){
        console.log(err)
    }else{
        console.log("successfully connected to "+port)
    }
})

plotDict ={ "an": "https://lh3.googleusercontent.com/L3BQfI4sRrBSIP9JZe2RzEVvbiIPHG6IDM6gBm0gxYn4Pt-HDf2E30wz1rEjcRuY3EjvBeqvoz0_q1bWHTs_s5h5QVosEMplQouNbx9TD3PL2sJP9Z7fj2Dlc0_nM0UudzFdSoF421g=w1920-h1080","ap": "https://lh3.googleusercontent.com/oBTE-Sz7woABnbxG_Ghw6fQNCuWK-7YANHkodb77uZZDs2NZR3VsFCCHqY5v5O5LxrQ8yM0BNT2rElAkw70Wj1TZhYBP88EEAqIE5uHzfkLCX-xZJK2yOOC66Jf4wuwxL0YiBVFch5c=w1920-h1080","ar": "https://lh3.googleusercontent.com/aBmQBjTI1icr1T3wYB5hZglZrbfHEQXIQmEYsy0SH3k9TZeCNpjRZxU5wJkC9vg0VDkQydP9aOE6qkgVW3_A6cT0tqFzJWojoHdJwH3Ixdm2yBch_osS69Sov0Yk1nO3cMmlE0_2rNQ=w1920-h1080","as": "https://lh3.googleusercontent.com/7z2JRfJRC8AGYMFsphXlR3pfQUgva-Jj36YUM4-GgwnBJOdcTTEy_jwY_04IY3AZPpyzCxhEWhKYFt6jHjrE2Ktu9znXF5fpNReUR2_EOweSXBC94nKhkO93JZz6u7U5FQhpfqkcNVY=w1920-h1080","br": "https://lh3.googleusercontent.com/ZfwuFFMZW7YYskndTfmGFiof_3HxugyIxswsCB_ClB1nzCl3I9SbTvE3YPOMJsV7CEcy6BoOK4yx32mvKLuZMKlnUSDtEQUHMdFGkYqyUbACjN8O_uRQP8wxYrhWpA_HHIiTpZQ-aZY=w1920-h1080","ch": "https://lh3.googleusercontent.com/3H1k4YFZbyHX0B-Z2NKhT7NW7NxDpJb4dqhZdxk8922e0245eEENkaLK2Ge_3HtVQRtZH59-StlqfVgKdwhgRrCdSmUa-vMSTk6ocIh0HHxpMqoL1OqyPvMFj7WImfjma1MbklcuSsg=w1920-h1080","ct": "https://lh3.googleusercontent.com/0pEi7fCqCEAfh02_EVrqeKcR3mzxmJlgx7CMqmptx1SIfH5WW-Ebacd5Pl1Faupx2EVCQxTeVZbWi_Frhlm2MBFS4NEjoevXTa7JH2_eYrga-7ooygKhjmPwSSuKVeb54dQ9AHFHasI=w1920-h1080","dd": "https://lh3.googleusercontent.com/LfLhkHlVkJCQ7Z9OrmspptEInKaJKtKatQdey3IlvyQox7lJOFPVIGm-LgZCzK-7b5gA9fafNmCV-rL0U5s3IJhpkLAwdOCrS4hX8cyJVV5wGbeUY0SksPUNHFNVvlfgH1lyVu4PXX8=w1920-h1080","dl": "https://lh3.googleusercontent.com/_ONGdqiP4K_jmO_0oFXxZSNFvzeaPpvFg9jp1_1ACrANPy0dHv0vUDCsDu2o2mfyAznmEQZgnwfyDzIu8o9tTDz0R-o1ALomAa3_cIxSwsW0Mhv2E-Cvr2UGUVvbVMQBMe_hGfvQOOk=w1920-h1080","dn": "https://lh3.googleusercontent.cxtom/qWFVVmsH10opi1khzaOwuf6eOS-_JPMt4VCkADcb6U_0Idl2LYtfo5Dbj24LFyMDYgNAtfTYRN8Z6Pj4ApvABkhJgdWJDqWWdDrdUEC6VEuM9tWkaSvf2fG5w3U7xgZjr9tAl3cg_9Q=w1920-h1080","ga": "https://lh3.googleusercontent.com/pOPBUqHISljvRz_QrzeiKMIwh5Gu-qiJAqB-WDnnEqAPmhNke31CyNLcuf89maiII_CAe7cLFOmJBn840i0DPvFzGrURTDbZPm2vrWvrr-cs-PWb21PAv1tEnpbKVzbWixad2tozn-g=w1920-h1080","gj": "https://lh3.googleusercontent.com/FvzOuklyrRM7-YcOvRbjDjcU24UVyRTujS_7qrlvnDADBYH_IGDjE_pDLeqoSouWajX39o464G3z0JtcI6962Sq0lGYS6RIFRGwBk5w9Lt6fHJHRejkfXOtgvuUzPG_laR2d6WGcZsk=w1920-h1080","hp": "https://lh3.googleusercontent.com/L3INGnTDOEUxh3jz8mG4GHvR1BgiRcmKOcdgfWmBfCKsQ83G3kBDZWJ5PRvl893Iz-uihUc-5_IyN_G2s1enNlpRJFktoBS4ZJdNOKGWIbfe33L78f6X-IGFIwqf-3XHLeJUlh6mZzo=w1920-h1080","hr": "https://lh3.googleusercontent.com/Ia1x7aiu_mh5v6gghxUuK0KkpX8NdMpSByYgGI668ra72h8Rw47M4pHaCEb2MqPCBmYJVDlS-gtUQrImXmzS3M23wbv6NynRq-0hrqonEszSybJ1JLb6QgNo1serhEjaEX_g4CQ36qc=w1920-h1080","jh": "https://lh3.googleusercontent.com/BZQYlenl2Wgj90KssyjGu1lGgvlbdpliB7-cjqTxsUpumkVZ1VXNzkhWL8_jej2C6wYM3rav_hAU0EdI46ODC3TtgiBwZip1hccjDfFlzci_DhmQC4oGWi5yaXdPW43QymKpy9ghbFE=w1920-h1080","jk": "https://lh3.googleusercontent.com/9U-GhX8z0Pt4WPHjXAg9VylLI7FD78VkQDcZUJlnDOK4JFkoI85-b40zG64Y26Ykiy5vY0gT5Ma55rvMKbGBM2YBzxDZxyANbktVUc7C3PPr6pM-yaKohQG8GPc_6gZnj9tX6ECSWuk=w1920-h1080","ka": "https://lh3.googleusercontent.com/9U-GhX8z0Pt4WPHjXAg9VylLI7FD78VkQDcZUJlnDOK4JFkoI85-b40zG64Y26Ykiy5vY0gT5Ma55rvMKbGBM2YBzxDZxyANbktVUc7C3PPr6pM-yaKohQG8GPc_6gZnj9tX6ECSWuk=w1920-h1080","kl": "https://lh3.googleusercontent.com/oqAMflRDce9tVC4TxZjvZ4q4PsbXhLFMrdKqueiyLSccV9hqy9h9XmTa_yUTLpy56HDes36xe80anRugRxAXvuqtC4aPtGXvP0JF5J0os8Xtshi7resEoyS8xh2OgQnSSgo1wySdZoE=w1920-h1080","la": "https://lh3.googleusercontent.com/LfLhkHlVkJCQ7Z9OrmspptEInKaJKtKatQdey3IlvyQox7lJOFPVIGm-LgZCzK-7b5gA9fafNmCV-rL0U5s3IJhpkLAwdOCrS4hX8cyJVV5wGbeUY0SksPUNHFNVvlfgH1lyVu4PXX8=w1920-h1080","ld": "https://lh3.googleusercontent.com/_3V_r0XZdVQsni18ady6pCNLikz9Ypcpzsx1LA5dcs7WGCSOsfZ5DVYGRtt8EebDmgGtr2JMdcuwUMBf5DFw1MYkhvstiPQflsmxffaDhTZnfRdF1cDgq7RpVWv2poKwcnDZ7QtZwgs=w1920-h1080","mh": "https://lh3.googleusercontent.com/rec2FJZt8-H2oz5UrSr8yIu8Vy1-dYqPQioK4E5z4XNoPyFzo0K275wKzgyDJWTmNiByV9w6dx4KG32hj3NHxu1QbqswMCbKWoQssbu2Ob7-Da06QcB3miN96BiuVjvZ8NaF-Y1EffE=w1920-h1080","ml": "https://lh3.googleusercontent.com/t6YzKcYb7w35_Zh7kfnEYwGJCPuHvVyqNxqQt5qmVWtjy-i8ivSgYLSFW4opqc4BXV6u6aQtE9L1BReJSsfU_qsV-98WOJuiIU8EGnHSelGGe5jW6xQS_wcAFhC1eC6juTIhmHVcGds=w1920-h1080","mn": "https://lh3.googleusercontent.com/RV9_h0gg2P_K7qEbATbnT1OinnyD9yc5XfDypjbe5QKyn6ghcuEorsdkR6lhFya-scUj4yDrKOcDe4CD46_jEOwv9ztfVC6-20Mx6gYVYHhZRhycFWV8wPBitPk8N1p5mKacA7RV_4Q=w1920-h1080","mp": "https://lh3.googleusercontent.com/Pue4d8aGDQMuJKDMS4xSno6bazcgX-LkuUMKpp3rgPNuokG4y_thCKUH-Tjwa2iD64d_vd9I34xDJq9SsK37hRkKSZ9N92Ig7ckA96QNIKgo78CjTLBSmKdgt-Wh1qDbToZa-_21e6o=w1920-h1080" ,"mz": "https://lh3.googleusercontent.com/KMd1amLrUzZ43uAzb98ODBLlKmP9ipx9WaQ9_iNbScvb083oPVPppuLn_ed1UVkCTplbOT_2wAoWpogbDocFtH6ZgEsLBykbocaGD4wZ6TVkWWYtIrjA7feEMJW1JaX9IJalJ0GkNZY=w1920-h1080","nl": "https://lh3.googleusercontent.com/rZXXjg_ZOXfGWy-DdRlRuDX3Oe4Ugmrc27RdZL_A0prbZY0UAf9n7iLa6HmzOgZ_4AzQT67L2FVXXukXIgvDH3ieAzAKANeLq3i7ROtBYbspQDOPYGlObi4H_p30vZhbXZTb1X_Bdag=w1920-h1080","or": "https://lh3.googleusercontent.com/VjaDlQbT6uG5XH4MoGzciJ_2mlUwbqQ9dZ02FBBG3CcGD-gfMojXLxJdvSpsI9jEtVb3pDGv0L3eajqWTBXXQ1GbGLhRVWQ7yuMinsa4HccnKj4Fxe-GHw9A7ifUeG6-v-VSUPF_YCs","pb": "https://lh3.googleusercontent.com/0vnh4qL45WRGq0Tuam2KW0qloemwjW9xRmBVYQBiSD0MrUDNgLNeSUC8M21YTWEPtmSj_L0jvf2je3RsFvWDQeZiaOt8GcaRa1Vmj1xSfthcfQEnBHWxwoIGhl5EvZnttQoiQ2vuYIM=w1920-h1080","py": "https://lh3.googleusercontent.com/IFh8zlb5ll3exucD1toNmf3vN7-axX0PtdG6Foc5eRZKUWMdlaFRhNQZcKi2yz5zw4TNR2_5VxlXVfNxcNYJQuzojlHeKWw8zzIhe0cBCFfb34FLlAh2QgYobj5abO_FguZQdsdgiAA=w1920-h1080","rj": "https://lh3.googleusercontent.com/IHw_PZ95kaOBlJBT9Hx24IuF-_M3OXIdUzGmYx-YCO5sSXKWr4W1YExxDS0QJdh8LZumRbG3fH40kWeYOEHgSwoAfsx0tq7Ha3OHkj7LLsXAhTxDv5cbjnuQt5jMAkLorrURRC_2epE","sk": "https://lh3.googleusercontent.com/4JOJXoVk2Pfo-KG768qyYoNgUvU2cGBRDgk-FUtrwEqE50emxmALH1LGcLO1zLwbBjiUZe4jKCQlDJYoiJZvmWZbHsyq2Z8d88wJh9yhq3eROsBegxABafb1j8e2mVP3B34arUGkUQY=w1920-h1080","tg": "https://lh3.googleusercontent.com/mz5978rNdJzjuWsxJ1mLRRWtulUdiSkUtYTeB4DGuxzI1yuBBqroGWK1eQUOWiYfi3S2h06LTApoAYSI_WVIxjvGmrJ9pVZzW-FCXUmXomGNfUAndqc5D4DP4vsJ2wg_tZ29rg_8r0k","tn": "https://lh3.googleusercontent.com/_fFndFQXcqWspKd_jz-WajAN3SUYa90fyUosxFqcLsgHsXWWSVkdhhUZ_-2nGK1Iq6kJ0ii-JHFwDZlkPpI-LGftie3_isJ7AMjKE2PXEibW8mUVSsdDchApxZX05OCHRZFn1LFcpwA=w1920-h1080","tr":"https://lh3.googleusercontent.com/dNfCrr5e-U-Vn5xt6EKuUdaRRY72QTPbgPSwzuIPGgAf3a8RHGZJSFcAYJ6HLBi7reBJ2xpz_Qlps_iR1viBLEe8rdTDVM8_uaQ2GxXz4WB7-xvLb17Bw8XMTnej14OdXW3F084ERMo=w1920-h1080","tt": "https://lh3.googleusercontent.com/RCEdn6ptXol8QjAplLkXyJW8TPqEkfEqLhfFMLrE5K7LnWoxSda7fXSXn6b1UcUuQl7TdYYLWEgmEE1dxQO-aEFVDDB8pDY_3Jv86vB9s9gMFB69rjP_xroKW8-f6ny5mM5U5vwDhpE=w1920-h1080","up": "https://lh3.googleusercontent.com/KVsgsDXPkWCxspmrR8_SaGWC3Oiize-vDJv65WbH0UHrbYmOf8Ced_xWk6GvWMayTpXlC6mKBXnokMN4dpiIBBqBRU0jEN6FFcAv2fis_HUVxnNliRAWCqmfPmNmONrZ_kAbkhDbLN8","ut": "https://lh3.googleusercontent.com/oNVwH3ULplb-1P83lvTccPvpD6TEPwBL_yEBTZpexqoIpXqRdueLKWw9AmcZAAI_acKun8BG1Z5tGTpq3qQHgPtq3G8JjkggnqVOzoxAfeWAaQgRZ3hu6xp_g_nkNF6rCiNiCd3iHAA","wb": "https://lh3.googleusercontent.com/TZrjRFMkCOjDhnbsgFUb8qe6ETM0Wzu7iOPPbQQGnh-ypZSvz7hr2zgX6_PLxGBlBSTCpw5iAweg49e34xfp3vR5iRMyiatCj42XQgEFDDPUbbYvU-dje9H5SB3u3fv_nTHw0AZ_4Q=w1920-h1080"}
stateDict = {
  'an': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fan.png?alt=media',
  'ap': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fap.png?alt=media',
  'ar': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Far.png?alt=media',
  'as': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fas.png?alt=media',
  'br': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fbr.png?alt=media',
  'ch': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fch.png?alt=media',
  'ct': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fct.png?alt=media',
  'dd': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fdd.png?alt=media',
  'dl': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fdl.png?alt=media',
  'dn': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fdn.png?alt=media',
  'ga': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fga.png?alt=media',
  'gj': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fgj.png?alt=media',
  'hp': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fhp.png?alt=media',
  'hr': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fhr.png?alt=media',
  'jh': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fjh.png?alt=media',
  'jk': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fjk.png?alt=media',
  'ka': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fka.png?alt=media',
  'kl': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fkl.png?alt=media',
  'la': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fla.png?alt=media',
  'ld': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fld.png?alt=media',
  'mh': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fmh.png?alt=media',
  'ml': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fml.png?alt=media',
  'mn': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fmn.png?alt=media',
  'mp': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fmp.png?alt=media',
  'mz': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fmz.png?alt=media',
  'nl': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fnl.png?alt=media',
  'or': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2For.png?alt=media',
  'pb': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fpb.png?alt=media',
  'py': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fpy.png?alt=media',
  'rj': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Frj.png?alt=media',
  'sk': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fsk.png?alt=media',
  'tg': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Ftg.png?alt=media',
  'tn': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Ftn.png?alt=media',
  'tr': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Ftr.png?alt=media',
  'tt': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Ftt.png?alt=media',
  'up': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fup.png?alt=media',
  'ut': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fut.png?alt=media',
  'wb': 'https://firebasestorage.googleapis.com/v0/b/brave-theater-255512.appspot.com/o/states%2Fwb.png?alt=media'
};
namesDict ={'an':'Andaman And Nicobar','ap': 'Andhra Pradesh','ar' :'Arunachal Pradesh','as'  : 'Assam','br' :'Bihar','ch': 'Chandigarh','ct' :'Chattisgarh','dd': 'Daman & Diu','dl' :'Delhi','dn' : 'Dardar and Nagar Haveli','ga': 'Goa','gj' :'Gujarath','hp' :'Himachal Pradesh','hr' : 'Haryana','jh' :'Jarkhand','jk': 'Jammu And Kashmir','ka': 'Karnataka','kl': 'Kerala','ld' : 'Ladakh','la': 'Lakshwadeep','mh': 'Maharashtra','me': 'Meghalaya','mn': 'Manipur','mp' : 'Madhya Pradesh','mz': 'Mizoram','nl': 'Nagaland','or': 'Orissa','pb': 'Punjab','py' :'Pondicherry','rj': 'Rajasthan','sk': 'Sikkim','tg': 'Telangana','tn': 'TamilNadu','tr' :'Tripura','up' :'UttarPradesh','ut': 'Uttarakand','wb' :'WestBengal','tt': 'Total'}

